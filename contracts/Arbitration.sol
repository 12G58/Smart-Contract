// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./GRULLToken.sol"; // Import your GRULLToken contract

contract Arbitration {
    GRULLToken public grullToken;

    uint256 public constant MINIMUM_VOTE_STAKE = 10 * 1e18; // 10 GRULL tokens minimum to vote
    uint256 public constant MAX_STAKE_THRESHOLD = 100 * 1e18; // Threshold to prevent monopoly

    struct Dispute {
        uint256 id;
        address partyA;
        address partyB;
        string details;
        address[] jurors;
        mapping(address => bool) votedForA;
        uint256 votesForA;
        uint256 votesForB;
        bool resolved;
    }

    mapping(uint256 => Dispute) public disputes;
    uint256 public disputeCount;
    mapping(address => uint256) public jurorStakes; // Tracks staked tokens by jurors
    address[] public activeJurors; // Active jurors with staked tokens

    event DisputeCreated(uint256 indexed id, address indexed partyA, address indexed partyB);
    event Voted(uint256 indexed disputeId, address indexed juror, bool voteForA);
    event DisputeResolved(uint256 indexed id, address winner);
    event JurorSelected(address indexed juror);
    event JurorAdded(address indexed juror);

    constructor(address _grullToken) {
        grullToken = GRULLToken(_grullToken);
    }

    // --- Dispute Creation ---
    function createDispute(address _partyB, string memory _details) public {
        disputeCount++;
        Dispute storage dispute = disputes[disputeCount];
        dispute.id = disputeCount;
        dispute.partyA = msg.sender;
        dispute.partyB = _partyB;
        dispute.details = _details;

        // Select jurors for the dispute
        dispute.jurors = selectJurors();

        emit DisputeCreated(disputeCount, msg.sender, _partyB);
    }

    // --- Juror Selection: Efficient, Weighted, and Sybil-Resistant ---
    function selectJurors() internal returns (address[] memory) {
        require(activeJurors.length >= 3, "Not enough active jurors");

        uint256 poolSize = activeJurors.length / 3; // Divide jurors into pools
        address[] memory selectedJurors = new address[](poolSize);

        // Randomized selection, weighted by staked tokens but with diminishing returns
        for (uint256 i = 0; i < poolSize; i++) {
            selectedJurors[i] = selectWeightedRandomJuror();
            emit JurorSelected(selectedJurors[i]);
        }

        return selectedJurors;
    }

    function selectWeightedRandomJuror() internal view returns (address) {
        uint256 totalWeight = 0;
        uint256[] memory weights = new uint256[](activeJurors.length);

        // Calculate total weight with diminishing returns to prevent monopolies
        for (uint256 i = 0; i < activeJurors.length; i++) {
            uint256 stake = jurorStakes[activeJurors[i]];
            weights[i] = quadraticWeight(stake);
            totalWeight += weights[i];
        }

        // Select random juror based on weights
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % totalWeight;
        for (uint256 i = 0; i < activeJurors.length; i++) {
            if (random < weights[i]) {
                return activeJurors[i];
            }
            random -= weights[i];
        }

        return activeJurors[0]; // Fallback to first juror
    }

    function quadraticWeight(uint256 _amount) internal pure returns (uint256) {
        return sqrt(_amount);
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    // --- Voting: Honest Voting and Incentives ---
    function vote(uint256 _disputeId, bool _voteForA) public {
        Dispute storage dispute = disputes[_disputeId];
        require(!dispute.resolved, "Dispute already resolved");
        require(grullToken.balanceOf(msg.sender) >= MINIMUM_VOTE_STAKE, "Not enough staked tokens to vote.");
        require(isJuror(_disputeId, msg.sender), "Not selected as juror.");
        require(!hasVoted(_disputeId, msg.sender), "Juror already voted.");

        // Stake tokens to vote
        grullToken.transferFrom(msg.sender, address(this), MINIMUM_VOTE_STAKE);

        // Record vote
        if (_voteForA) {
            dispute.votesForA++;
            dispute.votedForA[msg.sender] = true;
        } else {
            dispute.votesForB++;
        }

        emit Voted(_disputeId, msg.sender, _voteForA);
    }

    function hasVoted(uint256 _disputeId, address _juror) internal view returns (bool) {
        Dispute storage dispute = disputes[_disputeId];
        return dispute.votedForA[_juror] || !dispute.votedForA[_juror] && dispute.votesForB > 0;
    }

    function isJuror(uint256 _disputeId, address _juror) internal view returns (bool) {
        Dispute storage dispute = disputes[_disputeId];
        for (uint256 i = 0; i < dispute.jurors.length; i++) {
            if (dispute.jurors[i] == _juror) {
                return true;
            }
        }
        return false;
    }

    // --- Resolving Disputes: Incentives and Honest Voting ---
    function resolveDispute(uint256 _disputeId) public {
        Dispute storage dispute = disputes[_disputeId];
        require(!dispute.resolved, "Dispute already resolved");

        dispute.resolved = true;

        bool majorityInFavorOfA = dispute.votesForA > dispute.votesForB;
        address winner = majorityInFavorOfA ? dispute.partyA : dispute.partyB;

        // Reward and penalize jurors based on their votes
        for (uint256 i = 0; i < dispute.jurors.length; i++) {
            address juror = dispute.jurors[i];
            bool votedForA = dispute.votedForA[juror];

            if ((majorityInFavorOfA && votedForA) || (!majorityInFavorOfA && !votedForA)) {
                grullToken.transfer(juror, MINIMUM_VOTE_STAKE * 2); // Reward majority voters
            } else {
                grullToken.transfer(address(this), MINIMUM_VOTE_STAKE / 2); // Penalize minority voters
            }
        }

        emit DisputeResolved(_disputeId, winner);
    }

    // --- Juror Management ---
    function addJuror(address _juror, uint256 _stakeAmount) public {
        require(grullToken.balanceOf(msg.sender) >= _stakeAmount, "Insufficient GRULL tokens to stake.");
        jurorStakes[_juror] = _stakeAmount;
        activeJurors.push(_juror);

        emit JurorAdded(_juror);
    }
}

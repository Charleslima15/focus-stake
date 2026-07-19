// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @notice Minimal read-only interface into the already-deployed FocusStake
/// contract. We only need the two view functions to reconstruct a user's
/// streak — this contract never calls stake()/resolve() and cannot move
/// anyone's MON.
interface IFocusStake {
    enum Status {
        Active,
        Completed,
        Broken
    }

    struct Session {
        address user;
        uint256 amount;
        uint256 duration;
        uint256 startTime;
        Status status;
    }

    function getUserSessions(address user) external view returns (uint256[] memory);

    function getSession(uint256 sessionId) external view returns (Session memory);
}

/// @title FocusStreakBadge
/// @notice A simple, non-transferable-in-spirit (but standard ERC-721 for
/// wallet/marketplace compatibility) badge minted once per address after
/// they reach STREAK_THRESHOLD consecutive Completed sessions on FocusStake,
/// with no Broken session breaking the streak. One badge per address.
contract FocusStreakBadge is ERC721 {
    IFocusStake public immutable focusStake;
    uint256 public constant STREAK_THRESHOLD = 3;

    uint256 private _nextTokenId;

    mapping(address => bool) public hasBadge;
    mapping(uint256 => uint256) public tokenStreakLength;

    event BadgeMinted(address indexed user, uint256 indexed tokenId, uint256 streakLength);

    constructor(address focusStakeAddress) ERC721("Focus Streak Badge", "FSTREAK") {
        focusStake = IFocusStake(focusStakeAddress);
    }

    /// @notice Walks a user's sessions from most recent to oldest, counting
    /// consecutive Completed sessions until it hits a Broken one (or runs
    /// out of sessions). An Active session in progress does not count
    /// toward or against the streak yet.
    function currentStreak(address user) public view returns (uint256) {
        uint256[] memory ids = focusStake.getUserSessions(user);
        uint256 streak = 0;

        for (uint256 i = ids.length; i > 0; i--) {
            IFocusStake.Session memory s = focusStake.getSession(ids[i - 1]);
            if (s.status == IFocusStake.Status.Completed) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    function isEligible(address user) public view returns (bool) {
        return !hasBadge[user] && currentStreak(user) >= STREAK_THRESHOLD;
    }

    function claimBadge() external {
        require(!hasBadge[msg.sender], "Badge already claimed");
        uint256 streak = currentStreak(msg.sender);
        require(streak >= STREAK_THRESHOLD, "Streak below threshold");

        hasBadge[msg.sender] = true;

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        tokenStreakLength[tokenId] = streak;

        emit BadgeMinted(msg.sender, tokenId, streak);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint256 streak = tokenStreakLength[tokenId];
        return
            string(
                abi.encodePacked(
                    "data:application/json;utf8,",
                    '{"name":"Focus Streak Badge #',
                    Strings.toString(tokenId),
                    '","description":"Earned for a ',
                    Strings.toString(streak),
                    '-session consecutive focus streak on Focus Stake.",',
                    '"attributes":[{"trait_type":"Streak Length","value":',
                    Strings.toString(streak),
                    "}]}"
                )
            );
    }
}

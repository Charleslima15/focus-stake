// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title FocusStake — stake MON on a focus session, lose it to the shame pool if you break focus
contract FocusStake {
    enum Status { Active, Completed, Broken }

    struct Session {
        address user;
        uint256 amount;
        uint256 duration;   // seconds
        uint256 startTime;
        Status status;
    }

    address public owner;
    uint256 public shamePool;
    uint256 public nextSessionId;

    mapping(uint256 => Session) public sessions;
    mapping(address => uint256[]) public userSessions;

    event SessionStarted(uint256 indexed sessionId, address indexed user, uint256 amount, uint256 duration);
    event SessionResolved(uint256 indexed sessionId, address indexed user, bool completed, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    /// @notice Stake MON and start a timed focus session
    function stake(uint256 duration) external payable returns (uint256 sessionId) {
        require(msg.value > 0, "Stake must be > 0");
        require(duration > 0, "Duration must be > 0");

        sessionId = nextSessionId++;
        sessions[sessionId] = Session({
            user: msg.sender,
            amount: msg.value,
            duration: duration,
            startTime: block.timestamp,
            status: Status.Active
        });
        userSessions[msg.sender].push(sessionId);

        emit SessionStarted(sessionId, msg.sender, msg.value, duration);
    }

    /// @notice Resolve a session: refund on success, slash into shame pool on failure
    function resolve(uint256 sessionId, bool completed) external {
        Session storage s = sessions[sessionId];
        require(s.user == msg.sender, "Not your session");
        require(s.status == Status.Active, "Already resolved");

        if (completed) {
            require(block.timestamp >= s.startTime + s.duration, "Session not finished yet");
            s.status = Status.Completed;
            (bool sent, ) = payable(msg.sender).call{value: s.amount}("");
            require(sent, "Refund failed");
        } else {
            s.status = Status.Broken;
            shamePool += s.amount;
        }

        emit SessionResolved(sessionId, msg.sender, completed, s.amount);
    }

    // --- Views ---

    function getShamePool() external view returns (uint256) {
        return shamePool;
    }

    function getUserSessions(address user) external view returns (uint256[] memory) {
        return userSessions[user];
    }

    function getSession(uint256 sessionId) external view returns (Session memory) {
        return sessions[sessionId];
    }
}
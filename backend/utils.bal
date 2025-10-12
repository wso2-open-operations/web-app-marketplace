public isolated function checkUserGroups(string[] userGroups, string[] validUserGroups) returns boolean {
    if userGroups.length() === 0 {
        return true;
    }

    final string[] & readonly validUserGroupsReadOnly = validUserGroups.cloneReadOnly();
    return userGroups.every(group => validUserGroupsReadOnly.indexOf(group) !is ());
}

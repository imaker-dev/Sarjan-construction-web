import Api from "../api-client";

export default false
  ? { message: "You are Offline. Please turn on the internet" }
  : {
      // Get all memberships of an employee
      getEmployeeMemberships: (employeeId) => {
        return Api.get(`/employees/${employeeId}/memberships`);
      },

      // Add a department membership
      addEmployeeMembership: (employeeId, values) => {
        return Api.post(`/employees/${employeeId}/memberships`, values);
      },

      // Update membership (e.g. change primary)
      updateEmployeeMembership: (employeeId, membershipId, values) => {
        return Api.patch(
          `/employees/${employeeId}/memberships/${membershipId}`,
          values,
        );
      },

      // End a department membership
      endEmployeeMembership: (employeeId, membershipId, values) => {
        return Api.post(
          `/employees/${employeeId}/memberships/${membershipId}/end`,
          values,
        );
      },
    };
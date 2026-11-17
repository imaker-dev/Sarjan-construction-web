
import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      getEmployeeRoles: (employeeId) =>
        Api.get(`/employees/${employeeId}/assignments`),

      assignEmployeeRole: (employeeId, values) =>
        Api.post(`/employees/${employeeId}/assignments`, values),

      revokeEmployeeRole: (employeeId, assignmentId) =>
        Api.delete(
          `/employees/${employeeId}/assignments/${assignmentId}`,
        ),
    };

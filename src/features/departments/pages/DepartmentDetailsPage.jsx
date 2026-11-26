import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconArrowLeft, IconBuilding, IconCategory, IconShieldCheck } from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import { formatText } from "@utils/text.utils";
import DepartmentMembersPanel from "@features/departments/components/DepartmentMembersPanel";
import { useQueryParams } from "@hooks/useQueryParams";
import { useAccess } from "@hooks/useAccess";
import { getDepartmentById } from "@store/slices/department.slice";
import { PERMISSIONS } from "@constants/permissions";
import { ROUTES } from "@constants/routes";

export default function DepartmentDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { get } = useQueryParams();
  const departmentId = get("departmentId");

  const { can, user } = useAccess();
  const isCompanyAdmin = Boolean(user?.isCompanyScoped);
  const { currentDepartment } = useSelector((state) => state.department);

  useEffect(() => {
    if (departmentId) {
      dispatch(getDepartmentById(departmentId));
    }
  }, [dispatch, departmentId]);

  const dept = currentDepartment?.data || currentDepartment;
  const canOnboard = can({ permissions: [PERMISSIONS.EMPLOYEE.ONBOARD] });
  const canManageMembers = can({ permissions: [PERMISSIONS.EMPLOYEE.MEMBER_MANAGE] });
  const canReadContact =
    isCompanyAdmin || can({ permissions: [PERMISSIONS.EMPLOYEE.CONTACT_READ] });

  return (
    <div className="space-y-6 pb-12">
      <button
        type="button"
        onClick={() => navigate(ROUTES.DEPARTMENTS.ROOT)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft size={16} />
        <span>Back to Departments</span>
      </button>

      <PageHeaderBanner
        title={dept?.name || "Department Details"}
        description={`${dept?.code || "—"} • ${formatText(dept?.category || "GENERAL")}`}
        extra={
          dept?.status && (
            <StatusBadge
              label={formatText(dept.status)}
              tone={getStatusTone(dept.status)}
              size="md"
            />
          )
        }
      />
      <DepartmentMembersPanel
        departmentId={departmentId}
        canOnboard={canOnboard}
        canManageMembers={canManageMembers}
        canReadContact={canReadContact}
      />
    </div>
  );
}

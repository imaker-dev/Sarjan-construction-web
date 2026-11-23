import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import { useQueryParams } from "@hooks/useQueryParams";
import { getProjectDetails } from "@store/slices/project.slice";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const ProjectDetailsPage = () => {
  const dispatch = useDispatch();
  const { get } = useQueryParams();
  const projectId = get("projectId");

  const { projectData, isGettingProjectDetails } = useSelector(
    (state) => state.project,
  );

  useEffect(() => {
    if (!projectId) return;
    dispatch(getProjectDetails(projectId));
  }, [dispatch, projectId]);
  
  return (
    <div>
      <PageHeaderBanner title={"Project Details"} />
    </div>
  );
};

export default ProjectDetailsPage;

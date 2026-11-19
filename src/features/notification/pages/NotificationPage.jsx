import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import { listNotifications } from "@store/slices/notification.slice";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const NotificationPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(listNotifications());
  }, [dispatch]);

  const { isListingNotifications, notificationsData } = useSelector(
    (state) => state.notification,
  );

  console.log(notificationsData);
  return (
    <div>
      <PageHeaderBanner title={"Notifications   "} />
    </div>
  );
};

export default NotificationPage;

import { LogOut } from "lucide-react";
import Avatar from "@components/ui/Avatar";
import { useDispatch, useSelector } from "react-redux";
import ModalAction from "@components/ui/ModalAction";
import { logout } from "@store/slices/auth.slice";

export default function LogoutModal({ isOpen, onClose, loading = false }) {
  const dispatch = useDispatch();
  const handleConfirm = () => {
    dispatch(logout());
  };
  const { meData } = useSelector((state) => state.auth);
  const { displayName, loginId } = meData || {};
  return (
    <ModalAction
      id="logout-modal"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleConfirm}
      title="Log out of your account?"
      desc="You'll need to sign back in to access your workspace and continue where you left off."
      icon={LogOut}
      theme="danger"
      submitText="Log out"
      loadingText="Logging out"
      loading={loading}
    >
      {meData && (
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3.5 py-3">
          <Avatar name={displayName} size={36} />

          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">
              {displayName}
            </p>

            <p className="truncate text-[12.5px] text-muted-foreground">
              {loginId}
            </p>
          </div>
        </div>
      )}
    </ModalAction>
  );
}

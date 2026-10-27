import { LogOut } from "lucide-react";
import Avatar from "@components/ui/Avatar";
import { useSelector } from "react-redux";
import ModalAction from "@components/ui/ModalAction";

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) {
  const { meData } = useSelector((state) => state.auth);

  return (
    <ModalAction
      id="logout-modal"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onConfirm}
      title="Log out of your account?"
      desc="You'll need to sign back in to access your workspace and continue where you left off."
      icon={LogOut}
      theme="danger"
      submitText="Log out"
      loadingText="Logging out"
      loading={loading}
    >
      {meData && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/60 px-3.5 py-3">
          <Avatar name={meData.name} size={36} />

          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">
              {meData.name}
            </p>

            <p className="truncate text-[12.5px] text-muted-foreground">
              {meData.email}
            </p>
          </div>
        </div>
      )}
    </ModalAction>
  );
}

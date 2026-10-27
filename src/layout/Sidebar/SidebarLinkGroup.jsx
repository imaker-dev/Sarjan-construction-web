import { useEffect, useState } from "react";

function SidebarLinkGroup({ children, activecondition }) {
  const [open, setOpen] = useState(activecondition);

  useEffect(() => {
    if (activecondition) setOpen(true);
  }, [activecondition]);

  const handleClick = () => setOpen((prev) => !prev);

  return <li>{children(handleClick, open)}</li>;
}

export default SidebarLinkGroup;
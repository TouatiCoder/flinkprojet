import RoleHeader from "../../components/dashboard/Role/RoleHeader";
import RoleTable from "../../components/dashboard/Role/Table";
import RoleTableUsers from "../../components/dashboard/Role/TablePermissions";

function Role() {
  return (
    <>
      <RoleHeader />

      <div>
        <RoleTable />
        <RoleTableUsers />
      </div>
    </>
  );
}

export default Role;
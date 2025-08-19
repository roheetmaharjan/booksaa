// import UsersLayout from "../users/layout";
import { UsersLayout } from "@/app/admin/layout";

export default function CustomersList() {
  return (
    <UsersLayout>
      <div className="flex flex-row justify-between w-full">
        <h4 className="page-title">Customers</h4>
      </div>
    </UsersLayout>
  );
}

// import UsersLayout from "../users/layout";
import { UsersLayout } from "../layout";

export default function CustomersList() {
  return (
    <UsersLayout>
      <div className="container-fluid">
        <div className="flex flex-row justify-between w-full">
          <h4 className="page-title">Customers</h4>
        </div>
      </div>
    </UsersLayout>
  );
}

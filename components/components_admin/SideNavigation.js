import Link from "next/link"

export default function SideNavigation(){
    return(
        <div className="flex flex-col">
            <div className="flex">
                <Link>
                    <img src="./logo.png" alt="Aiila" />
                </Link>
            </div>
            <nav>
                <Link href="/">Dashboard</Link>
                <Link href="/">Orders</Link>
                <Link href="/">Customers</Link>
                <Link href="/">Settings</Link>
            </nav>
        </div>
    )
}
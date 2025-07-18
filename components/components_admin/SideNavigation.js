import Image from "next/image"
import Link from "next/link"

export default function SideNavigation(){
    return(
        <div className="flex flex-col">
            <div className="flex">
                <Link>
                    <Image src="./logo.png" width={100} height={50} alt="Bookaroo" />
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
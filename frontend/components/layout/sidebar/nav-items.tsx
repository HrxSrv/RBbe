"use client"

import { motion } from "framer-motion"
import { NavItem } from "./nav-item"
import {  BriefcaseIcon, HomeIcon,  Settings2, Users2Icon } from "lucide-react"

interface NavItemsProps {
  pathname: string
}

const navItems = [
  { href: "/dashboard", icon: HomeIcon, title: "Dashboard" },
  { href: "/dashboard/jobs", icon: BriefcaseIcon, title: "Jobs" },
  { href: "/dashboard/candidates", icon: Users2Icon, title: "Candidates" },
  {href: "/dashboard/settings", icon: Settings2, title: "Settings" },
]

export function NavItems({ pathname }: NavItemsProps) {
  return (
    <>
      {navItems.map((item) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <NavItem href={item.href} icon={item.icon} title={item.title} isActive={pathname === item.href} />
        </motion.div>
      ))}
    </>
  )
}

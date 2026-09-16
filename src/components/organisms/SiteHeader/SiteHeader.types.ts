export interface NavLink {
  label: string
  href: string
  active?: boolean
  id?: string
}

export interface SiteHeaderProps {
  title?: React.ReactNode
  subtitle?: string
  links?: NavLink[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  userName?: string
  userRole?: string
  onSignOut?: () => void
  onSearch?: (query: string) => void
  className?: string
}

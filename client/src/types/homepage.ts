export interface NotificationItem {
  id: number;
  title: string;
  date?: string;
  isNew?: boolean;
}

export interface PlacementItem {
  id: number;
  company: string;
  offers: number;
}

export interface EventItem {
  id: number;
  title: string;
  category: string;
  image: string;
}

export interface NavItem {
  label: string;
  hasDropdown?: boolean;
}

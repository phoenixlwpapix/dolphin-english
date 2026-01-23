"use client";

import {
  Play,
  Pause,
  Square,
  ChevronRight,
  ChevronLeft,
  Check,
  CircleCheck,
  CircleX,
  TriangleAlert,
  Volume2,
  ClipboardCheck,
  Clipboard,
  ClipboardList,
  BookOpen,
  Pencil,
  Plus,
  Calendar,
  ChartBar,
  Clock,
  RotateCw,
  Trash2,
  Search,
  ArrowUpDown,
  Home,
  Settings,
  User,
  LogOut,
  Globe,
  Lock,
  Library,
  LucideProps,
} from "lucide-react";

type IconProps = LucideProps;

/** Play icon for audio/video controls */
export function PlayIcon(props: IconProps) {
  return <Play {...props} />;
}

/** Pause icon for audio/video controls */
export function PauseIcon(props: IconProps) {
  return <Pause {...props} />;
}

/** Stop icon for audio/video controls */
export function StopIcon(props: IconProps) {
  return <Square {...props} fill="currentColor" />;
}

/** Chevron right icon for navigation */
export function ChevronRightIcon(props: IconProps) {
  return <ChevronRight {...props} />;
}

/** Chevron left icon for navigation */
export function ChevronLeftIcon(props: IconProps) {
  return <ChevronLeft {...props} />;
}

/** Check icon for success states */
export function CheckIcon(props: IconProps) {
  return <Check {...props} />;
}

/** Check icon (filled) for completed states */
export function CheckFilledIcon(props: IconProps) {
  return <CircleCheck {...props} />;
}

/** Check circle icon for completion */
export function CheckCircleIcon(props: IconProps) {
  return <CircleCheck {...props} />;
}

/** X icon (filled) for incorrect/error states */
export function XFilledIcon(props: IconProps) {
  return <CircleX {...props} />;
}

/** Warning triangle icon */
export function WarningIcon(props: IconProps) {
  return <TriangleAlert {...props} />;
}

/** Alert triangle icon - alias for WarningIcon */
export const AlertTriangleIcon = WarningIcon;

/** Speaker/volume icon for audio playback */
export function SpeakerIcon(props: IconProps) {
  return <Volume2 {...props} />;
}

/** Volume high icon for pronunciation */
export function VolumeHighIcon(props: IconProps) {
  return <Volume2 {...props} />;
}

/** Clipboard/checklist icon */
export function ClipboardCheckIcon(props: IconProps) {
  return <ClipboardCheck {...props} />;
}

/** Clipboard/document icon */
export function ClipboardIcon(props: IconProps) {
  return <Clipboard {...props} />;
}

/** Clipboard list icon */
export function ClipboardListIcon(props: IconProps) {
  return <ClipboardList {...props} />;
}

/** Book open icon for vocabulary/reading */
export function BookOpenIcon(props: IconProps) {
  return <BookOpen {...props} />;
}

/** Edit/pencil icon */
export function EditIcon(props: IconProps) {
  return <Pencil {...props} />;
}

/** Plus/Add icon */
export function PlusIcon(props: IconProps) {
  return <Plus {...props} />;
}

/** Calendar icon */
export function CalendarIcon(props: IconProps) {
  return <Calendar {...props} />;
}

/** Chart/Bar icon specific for word count or stats */
export function ChartBarIcon(props: IconProps) {
  return <ChartBar {...props} />;
}

/** Clock icon for time/duration */
export function ClockIcon(props: IconProps) {
  return <Clock {...props} />;
}

/** Rotate/Restart icon */
export function RotateCwIcon(props: IconProps) {
  return <RotateCw {...props} />;
}

/** Trash/Delete icon */
export function TrashIcon(props: IconProps) {
  return <Trash2 {...props} />;
}

/** Search/Magnifying glass icon */
export function SearchIcon(props: IconProps) {
  return <Search {...props} />;
}

/** Sort/Arrow down icon */
export function SortIcon(props: IconProps) {
  return <ArrowUpDown {...props} />;
}

/** Home icon for navigation */
export function HomeIcon(props: IconProps) {
  return <Home {...props} />;
}

/** Settings/Gear icon */
export function SettingsIcon(props: IconProps) {
  return <Settings {...props} />;
}

/** User icon */
export function UserIcon(props: IconProps) {
  return <User {...props} />;
}

/** Log out icon */
export function LogOutIcon(props: IconProps) {
  return <LogOut {...props} />;
}

/** Globe icon for public courses */
export function GlobeIcon(props: IconProps) {
  return <Globe {...props} />;
}

/** Lock icon for private courses */
export function LockIcon(props: IconProps) {
  return <Lock {...props} />;
}

/** Library icon for public courses */
export function LibraryIcon(props: IconProps) {
  return <Library {...props} />;
}


/**
 * Centralisation des icônes lucide-react par catégorie.
 * Import toujours depuis ici pour garder la cohérence taille/trait.
 */
export {
  // Actions
  Pencil,
  Trash2,
  Plus,
  Copy,
  GripVertical,
  Eye,
  Send,
  MoreVertical,
  Check,
  Search,
  SlidersHorizontal,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  RefreshCw,
  CloudOff,
  Download,
  Upload,
  ExternalLink,
  // Navigation
  LayoutDashboard,
  MapPin,
  Map,
  FileText,
  Users,
  LayoutTemplate,
  ShieldCheck,
  // Médias / terrain
  Camera,
  Image,
  Paperclip,
  // Types de question
  Type,
  AlignLeft,
  CircleDot,
  ListChecks,
  Gauge,
  Hash,
  Calendar,
  // Blocs de contenu
  Heading,
  AlignLeft as BlockText,
  SeparatorHorizontal,
  Code,
  // Statut / feedback
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  // Synchro / état
  Wifi,
  WifiOff,
  // Divers
  Menu,
  ChevronsLeft,
} from 'lucide-react';

/** Mapping type de question → icône lucide (pour QuestionTypePicker) */
import {
  Type, AlignLeft, CircleDot, ListChecks, Gauge, Hash, Calendar, MapPin, Camera, Paperclip,
} from 'lucide-react';
import type { QuestionType } from '@/shared/types';
import type { LucideIcon } from 'lucide-react';

export const QUESTION_TYPE_ICON: Record<QuestionType, LucideIcon> = {
  TEXT:          Type,
  LONG_TEXT:     AlignLeft,
  SINGLE_CHOICE: CircleDot,
  MULTI_CHOICE:  ListChecks,
  SCALE:         Gauge,
  NUMBER:        Hash,
  DATE:          Calendar,
  LOCATION:      MapPin,
  PHOTO:         Camera,
  FILE:          Paperclip,
};

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  TEXT:          'Texte court',
  LONG_TEXT:     'Texte long',
  SINGLE_CHOICE: 'Choix unique',
  MULTI_CHOICE:  'Choix multiple',
  SCALE:         'Échelle',
  NUMBER:        'Nombre',
  DATE:          'Date',
  LOCATION:      'Localisation',
  PHOTO:         'Photo',
  FILE:          'Fichier',
};

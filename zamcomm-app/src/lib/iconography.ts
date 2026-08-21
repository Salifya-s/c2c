import { createElement } from 'react';
import {
  FaArrowLeft,
  FaArrowTrendUp,
  FaBolt,
  FaBoxesStacked,
  FaCamera,
  FaCakeCandles,
  FaCartShopping,
  FaCheck,
  FaCreditCard,
  FaHeart,
  FaLocationDot,
  FaLock,
  FaMessage,
  FaMotorcycle,
  FaPhone,
  FaRegHeart,
  FaRegStar,
  FaScissors,
  FaShareNodes,
  FaShieldHeart,
  FaStore,
  FaUserCheck,
  FaUserGear,
  FaUserTie,
  FaWandMagicSparkles,
  FaWheatAwn,
  FaWrench,
} from 'react-icons/fa6';
import { FiBookmark, FiSearch, FiSend, FiShield, FiShoppingBag, FiUserPlus } from 'react-icons/fi';
import { HiMiniSparkles } from 'react-icons/hi2';
import { IoCheckmarkCircle, IoEllipsisHorizontal, IoFlash, IoTimeOutline } from 'react-icons/io5';
import { LuPackageCheck, LuPackageOpen } from 'react-icons/lu';
import { MdOutlineLocalFlorist } from 'react-icons/md';
import { PiBowlFoodFill, PiDressFill, PiHairDryerFill } from 'react-icons/pi';
import { TbDeviceLaptop, TbDeviceMobile, TbMapPinFilled } from 'react-icons/tb';

const vendorIconMap = {
  'mama-kunda': PiBowlFoodFill,
  'chanda-styles': PiDressFill,
  'beauty-mwila': PiHairDryerFill,
  greenfield: MdOutlineLocalFlorist,
  'baked-tasha': FaCakeCandles,
  'chisomo-clicks': FaCamera,
  techfix: FaWrench,
  'zambia-threads': FiShoppingBag,
};

const productIconMap = {
  'Chicken & Chips': PiBowlFoodFill,
  'Nshima + Chicken': PiBowlFoodFill,
  'Vitumbuwa (6pc)': FaCakeCandles,
  'Samp & Beans': FaWheatAwn,
  'Chitenge Dress': PiDressFill,
  'African Print Top': FiShoppingBag,
  "Men's Kaftan": FiShoppingBag,
  'Bridal Package': FaWandMagicSparkles,
  'Event Glam': PiHairDryerFill,
  'Natural Everyday': HiMiniSparkles,
  'Veg Box (5kg)': MdOutlineLocalFlorist,
  'Tomatoes (1kg)': MdOutlineLocalFlorist,
  'Mixed Fruits': MdOutlineLocalFlorist,
  'Custom Cake (6")': FaCakeCandles,
  'Cupcakes (12pc)': FaCakeCandles,
  'Croissants (6pc)': FaCakeCandles,
  'Event Coverage': FaCamera,
  'Portrait Session': FaCamera,
  'Product Shoot': FaBoxesStacked,
  'Screen Replacement': TbDeviceMobile,
  'Battery Swap': IoFlash,
  'Laptop Repair': TbDeviceLaptop,
  'Ankara Shirt (M)': FiShoppingBag,
  'Chitenge Skirt': PiDressFill,
  'Kids Set': FiShoppingBag,
};

const orderStatusIconMap = {
  Delivered: IoCheckmarkCircle,
  Upcoming: IoTimeOutline,
  Collected: LuPackageCheck,
};

const storyIconMap = {
  add: FiUserPlus,
  'mama-kunda': PiBowlFoodFill,
  'chanda-styles': PiDressFill,
  'beauty-mwila': PiHairDryerFill,
  'baked-tasha': FaCakeCandles,
  greenfield: MdOutlineLocalFlorist,
};

export const uiIcons = {
  back: FaArrowLeft,
  cart: FaCartShopping,
  checkout: FaCreditCard,
  verified: FaUserCheck,
  open: IoCheckmarkCircle,
  closed: IoTimeOutline,
  rating: FaRegStar,
  location: FaLocationDot,
  call: FaPhone,
  chat: FaMessage,
  send: FiSend,
  search: FiSearch,
  profile: FaUserTie,
  profileSettings: FaUserGear,
  addresses: TbMapPinFilled,
  payment: FaCreditCard,
  notifications: IoFlash,
  security: FiShield,
  logout: FaArrowLeft,
  share: FaShareNodes,
  like: FaHeart,
  likeOutline: FaRegHeart,
  save: FiBookmark,
  menu: IoEllipsisHorizontal,
  spark: HiMiniSparkles,
  store: FaStore,
  storefront: FiShoppingBag,
  shield: FaShieldHeart,
  lock: FaLock,
  package: LuPackageOpen,
  motorcycle: FaMotorcycle,
  trend: FaArrowTrendUp,
  bolt: FaBolt,
  scissors: FaScissors,
  customer: FiShoppingBag,
  seller: FaStore,
  provider: FaWandMagicSparkles,
  admin: FaUserGear,
  check: FaCheck,
};

function resolveIcon(map: Record<string, any>, key: string, fallback: any) {
  return map[key] || fallback;
}

export function VendorIcon({ vendorId, className = '', size = 24 }: { vendorId: string, className?: string, size?: number }) {
  return createElement(resolveIcon(vendorIconMap, vendorId, FaStore), { className, size });
}

export function ProductIcon({ productName, className = '', size = 24 }: { productName: string, className?: string, size?: number }) {
  return createElement(resolveIcon(productIconMap, productName, FiShoppingBag), { className, size });
}

export function StoryIcon({ storyId, className = '', size = 24 }: { storyId: string, className?: string, size?: number }) {
  return createElement(resolveIcon(storyIconMap, storyId, FiShoppingBag), { className, size });
}

export function OrderStatusIcon({ status, className = '', size = 16 }: { status: string, className?: string, size?: number }) {
  return createElement(resolveIcon(orderStatusIconMap, status, IoTimeOutline), { className, size });
}

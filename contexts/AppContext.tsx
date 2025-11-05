"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "km" | "zh" | "ko" | "ja";
type Theme = "light" | "dark";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    shop: "Shop",
    cart: "Cart",
    myOrders: "My Orders",
    profile: "Profile",
    adminDashboard: "Admin Dashboard",
    logout: "Logout",
    login: "Login",
    register: "Register",
    
    // Homepage
    welcomeStore: "Welcome to Our Store",
    discoverProducts: "Discover amazing products at great prices!",
    searchPlaceholder: "Search products by name or description...",
    search: "Search",
    found: "Found",
    products: "product(s)",
    addToCart: "Add to Cart",
    viewDetails: "View Details",
    outOfStock: "Out of Stock",
    noProducts: "No products available at the moment.",
    noSearchResults: "No products found for",
    clearSearch: "Clear Search",
    pleaseLogin: "Please login to purchase products",
    
    // Footer
    aboutUs: "E-Commerce Store",
    aboutDesc: "Your trusted online marketplace for quality products at great prices. Shop with confidence!",
    quickLinks: "Quick Links",
    shopProducts: "Shop Products",
    customerService: "Customer Service",
    supportEmail: "support@ecommerce.com",
    phone: "Phone",
    businessHours: "Mon-Fri: 9AM - 6PM",
    worldwideShipping: "Worldwide Shipping",
    whyShopUs: "Why Shop With Us",
    securePayments: "100% Secure Payments",
    freeShipping: "Free Shipping",
    easyReturns: "Easy Returns",
    qualityGuaranteed: "Quality Guaranteed",
    followUs: "Follow us:",
    copyright: "E-Commerce Store. All rights reserved.",
    madeWithLove: "Made with ❤️ for our customers",
    ourLocation: "Our Location - Cambodia",
    
    // Cart
    shoppingCart: "Shopping Cart",
    yourCart: "Your shopping cart",
    emptyCart: "Your cart is empty",
    startShopping: "Start shopping to add items to your cart",
    backToShop: "Back to Shop",
    quantity: "Quantity",
    price: "Price",
    total: "Total",
    remove: "Remove",
    subtotal: "Subtotal",
    proceedCheckout: "Proceed to Checkout",
    
    // Profile
    myProfile: "My Profile",
    name: "Name",
    email: "Email",
    avatar: "Avatar",
    uploadAvatar: "Upload Avatar",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    updateProfile: "Update Profile",
    
    // Orders
    orderPlaced: "Order Placed Successfully!",
    orderNumber: "Order",
    customer: "Customer",
    date: "Date",
    payment: "Payment",
    status: "Status",
    orderItems: "Order Items",
    pending: "Pending",
    paid: "Paid",
    shipped: "Shipped",
    delivered: "Delivered",
    
    // Admin
    manageProducts: "Manage Products",
    manageOrders: "Manage Orders",
    manageUsers: "Manage Users",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    deleteProduct: "Delete Product",
    productName: "Product Name",
    description: "Description",
    stock: "Stock",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
  },
  km: {
    // Navbar - Khmer
    shop: "ហាង",
    cart: "កន្ត្រក",
    myOrders: "ការបញ្ជាទិញរបស់ខ្ញុំ",
    profile: "ប្រវត្តិរូប",
    adminDashboard: "ផ្ទាំងគ្រប់គ្រង",
    logout: "ចាកចេញ",
    login: "ចូល",
    register: "ចុះឈ្មោះ",
    
    // Homepage
    welcomeStore: "សូមស្វាគមន៍មកកាន់ហាងរបស់យើង",
    discoverProducts: "រកឃើញផលិតផលអស្ចារ្យក្នុងតម្លៃល្អ!",
    searchPlaceholder: "ស្វែងរកផលិតផលតាមឈ្មោះ ឬការពិពណ៌នា...",
    search: "ស្វែងរក",
    found: "រកឃើញ",
    products: "ផលិតផល",
    addToCart: "បន្ថែមទៅកន្ត្រក",
    viewDetails: "មើលព័ត៌មានលម្អិត",
    outOfStock: "អស់ពីស្តុក",
    noProducts: "មិនមានផលិតផលនៅពេលនេះទេ។",
    noSearchResults: "រកមិនឃើញផលិតផលសម្រាប់",
    clearSearch: "សម្អាតការស្វែងរក",
    pleaseLogin: "សូមចូលដើម្បីទិញផលិតផល",
    
    // Footer
    aboutUs: "ហាងអនឡាញ",
    aboutDesc: "ទីផ្សារអនឡាញដែលអ្នកទុកចិត្តសម្រាប់ផលិតផលគុណភាពក្នុងតម្លៃល្អ!",
    quickLinks: "តំណភ្ជាប់រហ័ស",
    shopProducts: "ផលិតផលហាង",
    customerService: "សេវាកម្មអតិថិជន",
    supportEmail: "support@ecommerce.com",
    phone: "ទូរស័ព្ទ",
    businessHours: "ច-ស: 9ព្រឹក - 6ល្ងាច",
    worldwideShipping: "ដឹកជញ្ជូនទូទាំងពិភពលោក",
    whyShopUs: "ហេតុអ្វីទិញពីយើង",
    securePayments: "ការទូទាត់សុវត្ថិភាព 100%",
    freeShipping: "ដឹកជញ្ជូនឥតគិតថ្លៃ",
    easyReturns: "ការត្រឡប់វិញងាយស្រួល",
    qualityGuaranteed: "គុណភាពធានា",
    followUs: "តាមដានយើង:",
    copyright: "ហាងអនឡាញ។ រក្សាសិទ្ធិគ្រប់យ៉ាង។",
    madeWithLove: "បង្កើតដោយ ❤️ សម្រាប់អតិថិជនរបស់យើង",
    ourLocation: "ទីតាំងរបស់យើង - កម្ពុជា",
    
    // Cart
    shoppingCart: "កន្ត្រកទិញទំនិញ",
    yourCart: "កន្ត្រករបស់អ្នក",
    emptyCart: "កន្ត្រករបស់អ្នកទទេ",
    startShopping: "ចាប់ផ្តើមទិញទំនិញដើម្បីបន្ថែមទៅកន្ត្រក",
    backToShop: "ត្រឡប់ទៅហាង",
    quantity: "បរិមាណ",
    price: "តម្លៃ",
    total: "សរុប",
    remove: "លុប",
    subtotal: "សរុបរង",
    proceedCheckout: "បន្តទៅទូទាត់",
    
    // Profile
    myProfile: "ប្រវត្តិរូបរបស់ខ្ញុំ",
    name: "ឈ្មោះ",
    email: "អ៊ីមែល",
    avatar: "រូបតំណាង",
    uploadAvatar: "ផ្ទុកឡើងរូបតំណាង",
    changePassword: "ប្តូរពាក្យសម្ងាត់",
    currentPassword: "ពាក្យសម្ងាត់បច្ចុប្បន្ន",
    newPassword: "ពាក្យសម្ងាត់ថ្មី",
    confirmPassword: "បញ្ជាក់ពាក្យសម្ងាត់",
    updateProfile: "ធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូប",
    
    // Orders
    orderPlaced: "ការបញ្ជាទិញបានដាក់ដោយជោគជ័យ!",
    orderNumber: "លេខបញ្ជាទិញ",
    customer: "អតិថិជន",
    date: "កាលបរិច្ឆេទ",
    payment: "ការទូទាត់",
    status: "ស្ថានភាព",
    orderItems: "ទំនិញបញ្ជាទិញ",
    pending: "កំពុងរង់ចាំ",
    paid: "បានបង់",
    shipped: "បានដឹកជញ្ជូន",
    delivered: "បានចែកចាយ",
    
    // Admin
    manageProducts: "គ្រប់គ្រងផលិតផល",
    manageOrders: "គ្រប់គ្រងការបញ្ជាទិញ",
    manageUsers: "គ្រប់គ្រងអ្នកប្រើប្រាស់",
    addProduct: "បន្ថែមផលិតផល",
    editProduct: "កែផលិតផល",
    deleteProduct: "លុបផលិតផល",
    productName: "ឈ្មោះផលិតផល",
    description: "ការពិពណ៌នា",
    stock: "ស្តុក",
    actions: "សកម្មភាព",
    edit: "កែ",
    delete: "លុប",
  },
  zh: {
    // Navbar - Chinese
    shop: "商店",
    cart: "购物车",
    myOrders: "我的订单",
    profile: "个人资料",
    adminDashboard: "管理面板",
    logout: "登出",
    login: "登录",
    register: "注册",
    
    // Homepage
    welcomeStore: "欢迎来到我们的商店",
    discoverProducts: "以优惠的价格发现优质产品！",
    searchPlaceholder: "按名称或描述搜索产品...",
    search: "搜索",
    found: "找到",
    products: "个产品",
    addToCart: "加入购物车",
    viewDetails: "查看详情",
    outOfStock: "缺货",
    noProducts: "目前没有可用的产品。",
    noSearchResults: "未找到产品",
    clearSearch: "清除搜索",
    pleaseLogin: "请登录以购买产品",
    
    // Footer
    aboutUs: "电子商务商店",
    aboutDesc: "您值得信赖的在线市场，提供优质产品和优惠价格！",
    quickLinks: "快速链接",
    shopProducts: "商店产品",
    customerService: "客户服务",
    supportEmail: "support@ecommerce.com",
    phone: "电话",
    businessHours: "周一至周五：上午9点至下午6点",
    worldwideShipping: "全球配送",
    whyShopUs: "为什么选择我们",
    securePayments: "100% 安全支付",
    freeShipping: "免费送货",
    easyReturns: "轻松退货",
    qualityGuaranteed: "质量保证",
    followUs: "关注我们：",
    copyright: "电子商务商店。保留所有权利。",
    madeWithLove: "用 ❤️ 为我们的客户制作",
    ourLocation: "我们的位置 - 柬埔寨",
    
    // Cart
    shoppingCart: "购物车",
    yourCart: "您的购物车",
    emptyCart: "您的购物车是空的",
    startShopping: "开始购物以添加商品到购物车",
    backToShop: "返回商店",
    quantity: "数量",
    price: "价格",
    total: "总计",
    remove: "删除",
    subtotal: "小计",
    proceedCheckout: "继续结账",
    
    // Profile
    myProfile: "我的个人资料",
    name: "姓名",
    email: "电子邮件",
    avatar: "头像",
    uploadAvatar: "上传头像",
    changePassword: "更改密码",
    currentPassword: "当前密码",
    newPassword: "新密码",
    confirmPassword: "确认密码",
    updateProfile: "更新资料",
    
    // Orders
    orderPlaced: "订单已成功下单！",
    orderNumber: "订单",
    customer: "客户",
    date: "日期",
    payment: "支付",
    status: "状态",
    orderItems: "订单商品",
    pending: "待处理",
    paid: "已支付",
    shipped: "已发货",
    delivered: "已送达",
    
    // Admin
    manageProducts: "管理产品",
    manageOrders: "管理订单",
    manageUsers: "管理用户",
    addProduct: "添加产品",
    editProduct: "编辑产品",
    deleteProduct: "删除产品",
    productName: "产品名称",
    description: "描述",
    stock: "库存",
    actions: "操作",
    edit: "编辑",
    delete: "删除",
  },
  ko: {
    // Navbar - Korean
    shop: "상점",
    cart: "장바구니",
    myOrders: "내 주문",
    profile: "프로필",
    adminDashboard: "관리자 대시보드",
    logout: "로그아웃",
    login: "로그인",
    register: "회원가입",
    
    // Homepage
    welcomeStore: "우리 상점에 오신 것을 환영합니다",
    discoverProducts: "놀라운 제품을 저렴한 가격에 발견하세요!",
    searchPlaceholder: "이름 또는 설명으로 제품 검색...",
    search: "검색",
    found: "찾음",
    products: "제품",
    addToCart: "장바구니에 추가",
    viewDetails: "자세히 보기",
    outOfStock: "품절",
    noProducts: "현재 사용 가능한 제품이 없습니다.",
    noSearchResults: "제품을 찾을 수 없습니다",
    clearSearch: "검색 지우기",
    pleaseLogin: "제품을 구매하려면 로그인하세요",
    
    // Footer
    aboutUs: "전자상거래 상점",
    aboutDesc: "저렴한 가격으로 품질 좋은 제품을 제공하는 신뢰할 수 있는 온라인 마켓플레이스!",
    quickLinks: "빠른 링크",
    shopProducts: "상점 제품",
    customerService: "고객 서비스",
    supportEmail: "support@ecommerce.com",
    phone: "전화",
    businessHours: "월-금: 오전 9시 - 오후 6시",
    worldwideShipping: "전 세계 배송",
    whyShopUs: "우리를 선택하는 이유",
    securePayments: "100% 안전한 결제",
    freeShipping: "무료 배송",
    easyReturns: "간편한 반품",
    qualityGuaranteed: "품질 보증",
    followUs: "팔로우하기:",
    copyright: "전자상거래 상점. 모든 권리 보유.",
    madeWithLove: "고객을 위해 ❤️로 제작",
    ourLocation: "우리의 위치 - 캄보디아",
    
    // Cart
    shoppingCart: "장바구니",
    yourCart: "귀하의 장바구니",
    emptyCart: "장바구니가 비어 있습니다",
    startShopping: "쇼핑을 시작하여 장바구니에 상품을 추가하세요",
    backToShop: "상점으로 돌아가기",
    quantity: "수량",
    price: "가격",
    total: "합계",
    remove: "제거",
    subtotal: "소계",
    proceedCheckout: "결제 진행",
    
    // Profile
    myProfile: "내 프로필",
    name: "이름",
    email: "이메일",
    avatar: "아바타",
    uploadAvatar: "아바타 업로드",
    changePassword: "비밀번호 변경",
    currentPassword: "현재 비밀번호",
    newPassword: "새 비밀번호",
    confirmPassword: "비밀번호 확인",
    updateProfile: "프로필 업데이트",
    
    // Orders
    orderPlaced: "주문이 성공적으로 완료되었습니다!",
    orderNumber: "주문",
    customer: "고객",
    date: "날짜",
    payment: "결제",
    status: "상태",
    orderItems: "주문 항목",
    pending: "대기 중",
    paid: "결제 완료",
    shipped: "배송됨",
    delivered: "배송 완료",
    
    // Admin
    manageProducts: "제품 관리",
    manageOrders: "주문 관리",
    manageUsers: "사용자 관리",
    addProduct: "제품 추가",
    editProduct: "제품 편집",
    deleteProduct: "제품 삭제",
    productName: "제품 이름",
    description: "설명",
    stock: "재고",
    actions: "작업",
    edit: "편집",
    delete: "삭제",
  },
  ja: {
    // Navbar - Japanese
    shop: "ショップ",
    cart: "カート",
    myOrders: "注文履歴",
    profile: "プロフィール",
    adminDashboard: "管理ダッシュボード",
    logout: "ログアウト",
    login: "ログイン",
    register: "登録",
    
    // Homepage
    welcomeStore: "当店へようこそ",
    discoverProducts: "素晴らしい製品をお得な価格で発見しましょう！",
    searchPlaceholder: "名前または説明で製品を検索...",
    search: "検索",
    found: "見つかりました",
    products: "製品",
    addToCart: "カートに追加",
    viewDetails: "詳細を見る",
    outOfStock: "在庫切れ",
    noProducts: "現在利用可能な製品はありません。",
    noSearchResults: "製品が見つかりませんでした",
    clearSearch: "検索をクリア",
    pleaseLogin: "製品を購入するにはログインしてください",
    
    // Footer
    aboutUs: "Eコマースストア",
    aboutDesc: "お得な価格で高品質な製品を提供する信頼できるオンラインマーケットプレイス！",
    quickLinks: "クイックリンク",
    shopProducts: "ショップ製品",
    customerService: "カスタマーサービス",
    supportEmail: "support@ecommerce.com",
    phone: "電話",
    businessHours: "月-金：午前9時 - 午後6時",
    worldwideShipping: "世界中への配送",
    whyShopUs: "当店を選ぶ理由",
    securePayments: "100％安全な支払い",
    freeShipping: "送料無料",
    easyReturns: "簡単な返品",
    qualityGuaranteed: "品質保証",
    followUs: "フォローする：",
    copyright: "Eコマースストア。全著作権所有。",
    madeWithLove: "お客様のために ❤️ で作成",
    ourLocation: "当店の場所 - カンボジア",
    
    // Cart
    shoppingCart: "ショッピングカート",
    yourCart: "あなたのカート",
    emptyCart: "カートは空です",
    startShopping: "ショッピングを開始してカートに商品を追加",
    backToShop: "ショップに戻る",
    quantity: "数量",
    price: "価格",
    total: "合計",
    remove: "削除",
    subtotal: "小計",
    proceedCheckout: "チェックアウトに進む",
    
    // Profile
    myProfile: "マイプロフィール",
    name: "名前",
    email: "メール",
    avatar: "アバター",
    uploadAvatar: "アバターをアップロード",
    changePassword: "パスワードを変更",
    currentPassword: "現在のパスワード",
    newPassword: "新しいパスワード",
    confirmPassword: "パスワードを確認",
    updateProfile: "プロフィールを更新",
    
    // Orders
    orderPlaced: "注文が正常に完了しました！",
    orderNumber: "注文",
    customer: "顧客",
    date: "日付",
    payment: "支払い",
    status: "ステータス",
    orderItems: "注文アイテム",
    pending: "保留中",
    paid: "支払済み",
    shipped: "発送済み",
    delivered: "配達完了",
    
    // Admin
    manageProducts: "製品管理",
    manageOrders: "注文管理",
    manageUsers: "ユーザー管理",
    addProduct: "製品追加",
    editProduct: "製品編集",
    deleteProduct: "製品削除",
    productName: "製品名",
    description: "説明",
    stock: "在庫",
    actions: "アクション",
    edit: "編集",
    delete: "削除",
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Load saved language
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, toggleTheme, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

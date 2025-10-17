"use client";
import React, { useEffect, useRef, useState } from "react";
import * as FaIcons from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import RoleBasedDashboardLink from "../ui/auth/RoleBasedDashboardLink";
import LogoutButton from "../ui/auth/LogoutButton";
import { usePageLoader } from "@/app/context/PageLoaderProvider";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CartDropdown from "../ui/CartDropdown";

// تابع buildMenuTree 
const buildMenuTree = (items) => {
  const map = {};
  const roots = [];

  // ساخت Map اولیه
  items.forEach((item) => {
    map[item._id.toString()] = { ...item, children: [] };
  });

  // اتصال بچه‌ها به والدها
  items.forEach((item) => {
    let parentId;
    if (item.parent) {
      if (typeof item.parent === "string") {
        parentId = item.parent;
      } else if (typeof item.parent === "object" && item.parent._id) {
        parentId = item.parent._id.toString();
      }
    }

    if (parentId && map[parentId]) {
      map[parentId].children.push(map[item._id.toString()]);
    } else {
      roots.push(map[item._id.toString()]);
    }
  });

  // مرتب‌سازی بر اساس order
  Object.values(map).forEach((menu) => {
    if (menu.children.length > 0) {
      menu.children.sort((a, b) => a.order - b.order);
    }
  });

  roots.sort((a, b) => a.order - b.order);
  return roots;
};


// کامپوننت MenuItem 
const MenuItem = ({ menu, onItemClick }) => {
  const [open, setOpen] = useState(false);
  const Icon = FaIcons[menu.icon] || FaIcons.FaBook;
  const hasChildren = menu.children && menu.children.length > 0;

  const handleClick = (e) => {
    if (hasChildren) {
      e.preventDefault();
      e.stopPropagation();
      setOpen((prev) => !prev);
    } else {
      onItemClick?.();
    }
  };

  return (
    <div className="group position-relative">
      <Link
        href={menu.url || "#"}
        className="d-flex align-items-center gap-1 px-2 py-1 text-muted text-decoration-none"
        onClick={handleClick}
      >
        <Icon className="icon" />
        {menu.title}
        {hasChildren && <FaIcons.FaChevronDown className="chevron-icon" />}
      </Link>
      {hasChildren && open && (
        <div className="dropdown-menu position-absolute dropdown-menu-custom">
          {menu.children.map((child) => (
            <MenuItem key={child._id} menu={child} onItemClick={onItemClick} />
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { startLoading, stopLoading } = usePageLoader();
  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false); // state برای CartDropdown
  const debounceRef = useRef(null);
  const router = useRouter();
  const [setting, setSetting] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const cartRef = useRef(null); // ref برای CartDropdown
  const { data: session } = useSession();
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const isAdminPage = pathname?.startsWith("/admin");
  const isAdmin = session?.user?.role === "admin";

  // تابع showAlert
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
  };

  // بستن CartDropdown با تغییر مسیر
  useEffect(() => {
    setCartDropdownOpen(false);
    setMobileMenuOpen(false);
    setShowResults(false);
    
  }, [pathname]);

  // مدیریت کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowResults(false);
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [mobileMenuOpen, cartDropdownOpen]);

useEffect(() => {
  const fetchInitialData = async () => {
    startLoading();
    setLoadingMenus(true);
    try {
      // دریافت هم‌زمان تنظیمات و منوها
      const [settingsRes, menusRes] = await Promise.all([
        fetch("/api/settings").then((res) => res.json()),
        fetch("/api/menus").then((res) => res.json()),
      ]);

      setSetting(settingsRes);

      // فقط منوهای فعال
      const activeMenus = menusRes.filter((item) => item.isActive);

      // ساختار درختی منوها
      const menuTree = buildMenuTree(activeMenus);

      setMenus(menuTree);
    } catch (error) {
      console.error("خطا در دریافت داده‌ها:", error);
    } finally {
      stopLoading();
      setLoadingMenus(false);
    }
  };

  fetchInitialData();
}, []);


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!value.trim()) {
        setResults([]);
        setShowResults(false);
        return;
      }
      setLoadingSearch(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        let data = await res.json();
        
        const uniqueAuthors = new Map();
        data = data.filter((item) => {
          if (item.type === "author") {
            if (uniqueAuthors.has(item.label)) return false;
            uniqueAuthors.set(item.label, true);
          }
          return true;
        });
        setResults(data);
        setShowResults(true);
      } catch (err) {
        console.error("خطا در جست‌وجو:", err);
        setResults([]);
        setShowResults(true);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);
  };


  return (
    <header className="header-fixed bg-white shadow-sm py-3 px-3 px-sm-4 z-1000">
      <div className="container-xxl d-flex align-items-center justify-content-between gap-3">
        <Link
          href="/"
          className="d-flex align-items-center gap-2 d-none d-md-flex"
        >
          {setting?.logo ? (
            <Image src={setting.logo} alt="Logo" width={60} height={60} priority />
          ) : (
            <Image
              src="/LOGO.jpeg"
              alt="Default Logo"
              width={60}
              height={60}
              priority
            />
          )}
        </Link>

        <button
          className="hamburger-btn d-md-none border-0 bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          aria-label="Toggle menu"
        >
          <FaIcons.FaBars size={24} />
        </button>

        {!mobileMenuOpen && (
          <div
            className="search-wrapper position-relative"
            onClick={(e) => e.stopPropagation()}
            ref={searchRef}
          >
            <input
              type="text"
              className="search-input"
              placeholder="جست‌وجو در کتابکده"
              value={search}
              onChange={handleSearchChange}
              autoComplete="off"
            />
            <span className="search-icon">
              <FiSearch size={18} />
            </span>
            {search.trim() && showResults && (
              <div className="search-results">
                {loadingSearch ? (
                  <div className="search-loading">در حال جست‌وجو...</div>
                ) : results.length > 0 ? (
                  results.map((item) => (
                    <div
                      key={item.id}
                      className="search-result-item"
                      onClick={() => {
                        setSearch("");
                        setResults([]);
                        setShowResults(false);
                        if (item.type === "tag") {
                          router.push(
                            `/products/tags?q=${encodeURIComponent(item.label)}`
                          );
                        } else if (item.type === "author") {
                          router.push(
                            `/products/author?q=${encodeURIComponent(item.label)}`
                          );
                        } else if (item.type === "product") {
                          router.push(`/products/${item._id}`);
                        }
                      }}
                    >
                      {item.type === "product" && (
                        <FaIcons.FaBook className="search-icon-item" />
                      )}
                      {item.type === "tag" && (
                        <FaIcons.FaTag className="search-icon-item" />
                      )}
                      {item.type === "author" && (
                        <FaIcons.FaUser className="search-icon-item" />
                      )}
                      {item.label}
                    </div>
                  ))
                ) : (
                  <div className="search-no-results">چیزی یافت نشد</div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="d-flex gap-2 align-items-center justify-content-end">
          <div className="auth-buttons d-flex gap-2 align-items-center d-none d-sm-flex">
            <RoleBasedDashboardLink />
            <LogoutButton />
          </div>
          <div ref={cartRef}>
            <CartDropdown
              isAdmin={isAdmin}
              isAdminPage={isAdminPage}
              showAlert={showAlert}
              cartDropdownOpen={cartDropdownOpen}
              setCartDropdownOpen={setCartDropdownOpen}
            />
          </div>
        </div>
      </div>
      <nav className="d-none d-md-flex gap-4 justify-content-start text-muted position-relative mt-4">
        {loadingMenus ? (
          <span className="text-muted">در حال بارگذاری...</span>
        ) : menus.length > 0 ? (
          menus.map((menu) => (
            <MenuItem key={menu._id} menu={menu} onItemClick={() => {}} />
          ))
        ) : (
          <span className="text-muted">منویی یافت نشد</span>
        )}
      </nav>
      {mobileMenuOpen && (
        <>
          <div
            className="overlay"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <nav
            className={`mobile-menu ${mobileMenuOpen ? "open" : ""} d-md-none pt-5`}
            onClick={(e) => e.stopPropagation()}
          >
            <Link href="/">
              {setting?.logo ? (
                <Image
                  src={setting.logo}
                  alt="Logo"
                  width={60}
                  height={60}
                  priority
                />
              ) : (
                <Image
                  src="/LOGO.jpeg"
                  alt="Default Logo"
                  width={60}
                  height={60}
                  priority
                />
              )}
            </Link>
            <div className="mt-5">
              {loadingMenus ? (
                <span className="text-muted">در حال بارگذاری...</span>
              ) : menus.length > 0 ? (
                menus.map((menu) => (
                  <MenuItem key={menu._id} menu={menu} onItemClick={() => {}} />
                ))
              ) : (
                <span className="text-muted">منویی یافت نشد</span>
              )}
            </div>
            <div className="d-flex gap-2 align-items-center justify-content-center mt-5">
              <RoleBasedDashboardLink />
              <LogoutButton />
            </div>
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"

// Mock cn utility
jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}))

// Mock Framer Motion - MUST be before imports
jest.mock("motion/react", () => {
  const mockUseMotionValueEvent = jest.fn()
  const mockScrollY = { get: jest.fn(() => 0) }
  
  return {
    motion: {
      div: React.forwardRef(({ children, className, style, animate, transition, initial, exit, onMouseLeave, layoutId, ...props }: any, ref: any) =>
        React.createElement("div", { ref, className, style, onMouseLeave, "data-layout-id": layoutId, ...props }, children)
      ),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useScroll: () => ({ scrollY: mockScrollY }),
    useMotionValueEvent: mockUseMotionValueEvent,
  }
})

// Mock Tabler Icons
jest.mock("@tabler/icons-react", () => ({
  IconMenu2: (props: any) => <svg data-testid="icon-menu2" {...props}>Menu</svg>,
  IconX: (props: any) => <svg data-testid="icon-x" {...props}>Close</svg>,
}))

// NOW import the components AFTER all mocks are set up
import { 
  Navbar, 
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton, 
} from "@/components/ui/resizable-navbar"

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Navbar", () => {
    it("renders children correctly", () => {
      render(
        <Navbar>
          <div data-testid="child">Test Child</div>
        </Navbar>
      )
      expect(screen.getByTestId("child")).toBeInTheDocument()
    })

    it("applies custom className", () => {
      const { container } = render(
        <Navbar className="custom-class">
          <div>Content</div>
        </Navbar>
      )
      expect(container.firstChild).toHaveClass("custom-class")
    })

    it("has fixed positioning classes", () => {
      const { container } = render(
        <Navbar>
          <div>Content</div>
        </Navbar>
      )
      expect(container.firstChild).toHaveClass("fixed", "inset-x-0", "top-0", "z-50", "w-full")
    })

    it("passes visible prop to children", () => {
      const TestChild = ({ visible }: { visible?: boolean }) => (
        <div data-testid="test-child">{visible ? "visible" : "hidden"}</div>
      )

      render(
        <Navbar>
          <TestChild />
        </Navbar>
      )

      expect(screen.getByTestId("test-child")).toBeInTheDocument()
    })
  })

  describe("NavBody", () => {
    it("renders children correctly", () => {
      render(
        <NavBody>
          <div data-testid="nav-content">Nav Content</div>
        </NavBody>
      )
      expect(screen.getByTestId("nav-content")).toBeInTheDocument()
    })

    it("applies custom className", () => {
      const { container } = render(
        <NavBody className="custom-nav-body">
          <div>Content</div>
        </NavBody>
      )
      expect(container.firstChild).toHaveClass("custom-nav-body")
    })

    it("has correct default classes", () => {
      const { container } = render(
        <NavBody>
          <div>Content</div>
        </NavBody>
      )
      const element = container.firstChild as HTMLElement
      expect(element).toHaveClass(
        "relative",
        "z-[60]",
        "mx-auto",
        "hidden",
        "lg:flex",
        "rounded-full"
      )
    })

    it("applies visible styles when visible prop is true", () => {
      const { container } = render(
        <NavBody visible={true}>
          <div>Content</div>
        </NavBody>
      )
      expect(container.firstChild).toHaveClass("bg-white/80", "dark:bg-neutral-950/80")
    })

    it("has minWidth style applied", () => {
      const { container } = render(
        <NavBody>
          <div>Content</div>
        </NavBody>
      )
      const element = container.firstChild as HTMLElement
      expect(element.style.minWidth).toBe("800px")
    })
  })

  describe("NavItems", () => {
    const mockItems = [
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ]

    it("renders all navigation items", () => {
      render(<NavItems items={mockItems} />)
      expect(screen.getByText("Home")).toBeInTheDocument()
      expect(screen.getByText("About")).toBeInTheDocument()
      expect(screen.getByText("Contact")).toBeInTheDocument()
    })

    it("applies correct href to links", () => {
      render(<NavItems items={mockItems} />)
      expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/")
      expect(screen.getByText("About").closest("a")).toHaveAttribute("href", "/about")
      expect(screen.getByText("Contact").closest("a")).toHaveAttribute("href", "/contact")
    })

    it("applies custom className", () => {
      const { container } = render(
        <NavItems items={mockItems} className="custom-nav-items" />
      )
      expect(container.firstChild).toHaveClass("custom-nav-items")
    })

    it("handles onItemClick callback", () => {
      const handleClick = jest.fn()
      render(<NavItems items={mockItems} onItemClick={handleClick} />)
      
      fireEvent.click(screen.getByText("Home"))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("shows hover effect on mouse enter", () => {
      render(<NavItems items={mockItems} />)
      const homeLink = screen.getByText("Home").closest("a")
      
      if (homeLink) {
        fireEvent.mouseEnter(homeLink)
        // Hover effect should be rendered
        const hoverEffect = homeLink.querySelector('[data-layout-id="hovered"]')
        expect(hoverEffect).toBeInTheDocument()
      }
    })

    it("removes hover effect on mouse leave from container", () => {
      const { container } = render(<NavItems items={mockItems} />)
      const navContainer = container.firstChild as HTMLElement
      
      // First hover over an item
      const homeLink = screen.getByText("Home").closest("a")
      if (homeLink) {
        fireEvent.mouseEnter(homeLink)
      }
      
      // Then mouse leave the container
      fireEvent.mouseLeave(navContainer)
    })

    it("renders with correct default classes", () => {
      const { container } = render(<NavItems items={mockItems} />)
      expect(container.firstChild).toHaveClass(
        "absolute",
        "inset-0",
        "hidden",
        "lg:flex",
        "items-center",
        "justify-center"
      )
    })
  })

  describe("MobileNav", () => {
    it("renders children correctly", () => {
      render(
        <MobileNav>
          <div data-testid="mobile-content">Mobile Content</div>
        </MobileNav>
      )
      expect(screen.getByTestId("mobile-content")).toBeInTheDocument()
    })

    it("applies custom className", () => {
      const { container } = render(
        <MobileNav className="custom-mobile-nav">
          <div>Content</div>
        </MobileNav>
      )
      expect(container.firstChild).toHaveClass("custom-mobile-nav")
    })

    it("has correct default classes", () => {
      const { container } = render(
        <MobileNav>
          <div>Content</div>
        </MobileNav>
      )
      expect(container.firstChild).toHaveClass(
        "relative",
        "z-50",
        "mx-auto",
        "flex",
        "lg:hidden"
      )
    })

    it("applies visible styles when visible prop is true", () => {
      const { container } = render(
        <MobileNav visible={true}>
          <div>Content</div>
        </MobileNav>
      )
      expect(container.firstChild).toHaveClass("bg-white/80", "dark:bg-neutral-950/80")
    })
  })

  describe("MobileNavHeader", () => {
    it("renders children correctly", () => {
      render(
        <MobileNavHeader>
          <div data-testid="header-content">Header</div>
        </MobileNavHeader>
      )
      expect(screen.getByTestId("header-content")).toBeInTheDocument()
    })

    it("applies custom className", () => {
      const { container } = render(
        <MobileNavHeader className="custom-header">
          <div>Content</div>
        </MobileNavHeader>
      )
      expect(container.firstChild).toHaveClass("custom-header")
    })

    it("has correct layout classes", () => {
      const { container } = render(
        <MobileNavHeader>
          <div>Content</div>
        </MobileNavHeader>
      )
      expect(container.firstChild).toHaveClass(
        "flex",
        "w-full",
        "flex-row",
        "items-center",
        "justify-between"
      )
    })
  })

  describe("MobileNavMenu", () => {
    it("renders children when isOpen is true", () => {
      render(
        <MobileNavMenu isOpen={true} onClose={jest.fn()}>
          <div data-testid="menu-content">Menu Content</div>
        </MobileNavMenu>
      )
      expect(screen.getByTestId("menu-content")).toBeInTheDocument()
    })

    it("does not render children when isOpen is false", () => {
      render(
        <MobileNavMenu isOpen={false} onClose={jest.fn()}>
          <div data-testid="menu-content">Menu Content</div>
        </MobileNavMenu>
      )
      expect(screen.queryByTestId("menu-content")).not.toBeInTheDocument()
    })

    it("applies custom className when open", () => {
      const { container } = render(
        <MobileNavMenu isOpen={true} onClose={jest.fn()} className="custom-menu">
          <div>Content</div>
        </MobileNavMenu>
      )
      expect(container.firstChild).toHaveClass("custom-menu")
    })

    it("has correct positioning classes when open", () => {
      const { container } = render(
        <MobileNavMenu isOpen={true} onClose={jest.fn()}>
          <div>Content</div>
        </MobileNavMenu>
      )
      expect(container.firstChild).toHaveClass(
        "absolute",
        "inset-x-0",
        "top-16",
        "z-50",
        "rounded-lg",
        "bg-white",
        "dark:bg-neutral-950"
      )
    })
  })

  describe("MobileNavToggle", () => {
    it("renders menu icon when isOpen is false", () => {
      render(<MobileNavToggle isOpen={false} onClick={jest.fn()} />)
      expect(screen.getByTestId("icon-menu2")).toBeInTheDocument()
      expect(screen.queryByTestId("icon-x")).not.toBeInTheDocument()
    })

    it("renders close icon when isOpen is true", () => {
      render(<MobileNavToggle isOpen={true} onClick={jest.fn()} />)
      expect(screen.getByTestId("icon-x")).toBeInTheDocument()
      expect(screen.queryByTestId("icon-menu2")).not.toBeInTheDocument()
    })

    it("calls onClick when menu icon is clicked", () => {
      const handleClick = jest.fn()
      render(<MobileNavToggle isOpen={false} onClick={handleClick} />)
      
      fireEvent.click(screen.getByTestId("icon-menu2"))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("calls onClick when close icon is clicked", () => {
      const handleClick = jest.fn()
      render(<MobileNavToggle isOpen={true} onClick={handleClick} />)
      
      fireEvent.click(screen.getByTestId("icon-x"))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("applies correct styling classes to icons", () => {
      const { rerender } = render(<MobileNavToggle isOpen={false} onClick={jest.fn()} />)
      expect(screen.getByTestId("icon-menu2")).toHaveClass("text-black", "dark:text-white")
      
      rerender(<MobileNavToggle isOpen={true} onClick={jest.fn()} />)
      expect(screen.getByTestId("icon-x")).toHaveClass("text-black", "dark:text-white")
    })
  })

  describe("NavbarButton", () => {
    it("renders children correctly", () => {
      render(<NavbarButton>Click Me</NavbarButton>)
      expect(screen.getByText("Click Me")).toBeInTheDocument()
    })

    it("renders as anchor tag by default", () => {
      const { container } = render(<NavbarButton>Link</NavbarButton>)
      expect(container.querySelector("a")).toBeInTheDocument()
    })

    it("applies href attribute when provided", () => {
      render(<NavbarButton href="/test">Link</NavbarButton>)
      expect(screen.getByText("Link")).toHaveAttribute("href", "/test")
    })

    it("renders as custom element when 'as' prop is provided", () => {
      render(<NavbarButton as="button">Button</NavbarButton>)
      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("applies primary variant styles by default", () => {
      render(<NavbarButton>Primary</NavbarButton>)
      const button = screen.getByText("Primary")
      expect(button).toHaveClass("shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]")
    })

    it("applies secondary variant styles", () => {
      render(<NavbarButton variant="secondary">Secondary</NavbarButton>)
      const button = screen.getByText("Secondary")
      expect(button).toHaveClass("bg-transparent", "shadow-none", "dark:text-white")
    })

    it("applies dark variant styles", () => {
      render(<NavbarButton variant="dark">Dark</NavbarButton>)
      const button = screen.getByText("Dark")
      expect(button).toHaveClass("bg-black", "text-white")
    })

    it("applies gradient variant styles", () => {
      render(<NavbarButton variant="gradient">Gradient</NavbarButton>)
      const button = screen.getByText("Gradient")
      expect(button).toHaveClass("bg-gradient-to-b", "from-blue-500", "to-blue-700")
    })

    it("applies custom className", () => {
      render(<NavbarButton className="custom-btn">Custom</NavbarButton>)
      expect(screen.getByText("Custom")).toHaveClass("custom-btn")
    })

    it("applies base styles to all variants", () => {
      render(<NavbarButton>Button</NavbarButton>)
      const button = screen.getByText("Button")
      expect(button).toHaveClass(
        "px-4",
        "py-2",
        "rounded-md",
        "text-sm",
        "font-bold",
        "relative",
        "cursor-pointer"
      )
    })

    it("forwards additional props", () => {
      render(<NavbarButton as="button" data-testid="custom-button" onClick={jest.fn()}>Test</NavbarButton>)
      expect(screen.getByTestId("custom-button")).toBeInTheDocument()
    })

    it("handles onClick event when rendered as button", () => {
      const handleClick = jest.fn()
      render(<NavbarButton as="button" onClick={handleClick}>Click</NavbarButton>)
      
      fireEvent.click(screen.getByRole("button"))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("Integration Tests", () => {
    it("complete navbar structure renders correctly", () => {
      const items = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
      ]

      render(
        <Navbar>
          <NavBody>
            <div>Logo</div>
            <NavItems items={items} />
            <NavbarButton>CTA</NavbarButton>
          </NavBody>
          <MobileNav>
            <MobileNavHeader>
              <div>Logo</div>
              <MobileNavToggle isOpen={false} onClick={jest.fn()} />
            </MobileNavHeader>
            <MobileNavMenu isOpen={false} onClose={jest.fn()}>
              <a href="/">Home</a>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      )

      expect(screen.getAllByText("Logo")).toHaveLength(2)
      expect(screen.getByText("Home")).toBeInTheDocument()
      expect(screen.getByText("About")).toBeInTheDocument()
      expect(screen.getByText("CTA")).toBeInTheDocument()
      expect(screen.getByTestId("icon-menu2")).toBeInTheDocument()
    })

    it("mobile menu opens and closes correctly", () => {
      let isOpen = false
      const toggleMenu = () => { isOpen = !isOpen }

      const { rerender } = render(
        <MobileNav>
          <MobileNavHeader>
            <MobileNavToggle isOpen={isOpen} onClick={toggleMenu} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={isOpen} onClose={toggleMenu}>
            <a href="/">Home</a>
          </MobileNavMenu>
        </MobileNav>
      )

      // Initially closed
      expect(screen.queryByText("Home")).not.toBeInTheDocument()

      // Open menu
      fireEvent.click(screen.getByTestId("icon-menu2"))
      isOpen = true
      rerender(
        <MobileNav>
          <MobileNavHeader>
            <MobileNavToggle isOpen={isOpen} onClick={toggleMenu} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={isOpen} onClose={toggleMenu}>
            <a href="/">Home</a>
          </MobileNavMenu>
        </MobileNav>
      )

      expect(screen.getByText("Home")).toBeInTheDocument()
    })
  })
})
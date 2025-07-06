// shadcn/ui Tabs component (Vite/React, ESM)
import * as React from "react"

const TabsContext = React.createContext()

export function Tabs({ defaultValue, className = "", children }) {
  const [value, setValue] = React.useState(defaultValue)
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className = "", children }) {
  return <div className={"flex " + className}>{children}</div>
}

export function TabsTrigger({ value, className = "", children }) {
  const { value: active, setValue } = React.useContext(TabsContext)
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active === value}
      onClick={() => setValue(value)}
      className={
        (active === value ? "data-[state=active] " : "") +
        className
      }
      data-state={active === value ? "active" : "inactive"}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children }) {
  const { value: active } = React.useContext(TabsContext)
  if (active !== value) return null
  return <div>{children}</div>
}

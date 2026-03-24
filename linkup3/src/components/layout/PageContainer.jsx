export default function PageContainer({ children }) {
  return (
    <main 
      className="lg:ml-64 pt-16 p-4 lg:p-6 min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {children}
    </main>
  )
}

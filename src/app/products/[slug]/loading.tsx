export default function LoadingProductPage() {
  return (
    <main className="min-h-screen bg-surface px-5 pt-28 md:px-10 lg:px-16">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="h-10 w-10 rounded-full bg-surface-container-high" />
          <div className="h-3 w-40 bg-surface-container-high" />
          <div className="h-16 w-full max-w-[520px] bg-surface-container-high" />
          <div className="h-4 w-full max-w-[430px] bg-surface-container-high" />
          <div className="h-4 w-2/3 bg-surface-container-high" />
        </div>
        <div className="lg:col-span-4">
          <div className="aspect-[4/5] w-full bg-surface-container-high" />
        </div>
        <div className="lg:col-span-3">
          <div className="h-[420px] w-full bg-white" />
        </div>
      </div>
    </main>
  );
}

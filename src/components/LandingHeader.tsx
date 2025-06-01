function LandingHeader() {
  return (
    <header className="bg-white text-blue-600">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          {/* Logo */}
          <div className="flex flex-col w-full gap-2 items-center">
            <div className="w-15 h-15">
              <img src="/image.png" alt="" />
            </div>
            <div className="flex flex-col items-center text-4xl">
              በየካ ክፍለ ከተማ ብልፅግና ፓርቲ ቅርንጫፍ ጽ/ቤት የፖለቲካ አቅምናና ግንባታ ዘርፍ የተዘጋጀ
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default LandingHeader;

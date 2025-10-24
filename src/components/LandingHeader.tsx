function LandingHeader() {
  return (
    <header className="bg-white text-blue-600">
      <div className="container mx-auto px-4 py-3 md:py-4">
        -
        <div className="flex items-center justify-center">
          {/* Logo */}
          <div className="flex flex-col w-full gap-1 md:gap-2 items-center">
            <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16">
              <img
                src="/image.png"
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col items-center text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-center px-2">
              በበልፅግና ፓርቲ የአዲስ አበባ ቅርንጫፍ ፅ/ቤት የፖለቲካ አቅምና ግንባታ ዘርፍ የተዘጋጀ
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default LandingHeader;

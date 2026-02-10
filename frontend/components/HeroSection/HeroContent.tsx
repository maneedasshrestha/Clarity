"use client";

const HeroContent = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[60vh] py-16 px-4 text-center overflow-hidden">
      <div className="mb-6">
        <span className="inline-block px-5 py-2 rounded-full font-medium text-sm backdrop-blur border shadow-sm bg-black/10 text-gray-900 border-black/10 dark:bg-white/20 dark:text-white dark:border-white/30">
          Reciepts Don't Lie :D
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg mb-4 text-gray-900 dark:text-white">
        Being broke is temporary.
        <br />
        <span className="text-gray-700 dark:text-white/80">
          Not knowing why shouldn’t be.
        </span>
      </h1>

      <div className="flex flex-row gap-6 mt-8 justify-center">
        <button className="px-8 py-3 rounded-full font-semibold text-lg shadow transition focus:outline-none bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default HeroContent;

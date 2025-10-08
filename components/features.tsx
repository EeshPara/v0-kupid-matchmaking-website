import Image from "next/image"

export function Features() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6">
        <div className="grid gap-16 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center">
              <Image
                src="/images/design-mode/image%2019.png"
                alt="Kupid"
                width={96}
                height={96}
                className="h-24 w-24"
              />
            </div>
            <h3 className="text-2xl font-bold text-black">100+Students</h3>
            <p className="text-base leading-relaxed text-gray-600">
              With more than 100 students, everyone can find someone to fit their needs
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center">
              <Image
                src="/images/design-mode/image%2018.png"
                alt="AI Algorithm"
                width={96}
                height={96}
                className="h-24 w-24"
              />
            </div>
            <h3 className="text-2xl font-bold text-black">AI Algorithm</h3>
            <p className="text-base leading-relaxed text-gray-600">
              The algorithm analyzes your profiles and comparing your preferences.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center">
              <Image
                src="/images/design-mode/image%2010.png"
                alt="Perfect Match"
                width={96}
                height={96}
                className="h-24 w-24"
              />
            </div>
            <h3 className="text-2xl font-bold text-black">Perfect Match</h3>
            <p className="text-base leading-relaxed text-gray-600">
              The matchmaker algorithm finds your ideal date and person
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

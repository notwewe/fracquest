import Image from "next/image"

export default function FixedLessMooreBridgeBackground() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10">
      <Image
        src="/game backgrounds/Fixed LessMoore Bridge.png"
        alt="Fixed LessMoore Bridge Background"
        fill
        priority
        className="object-cover w-full h-full"
      />
    </div>
  )
}

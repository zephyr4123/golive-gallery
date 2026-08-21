import { useState } from 'react'
import { motion } from 'motion/react'
import Typewriter from './Typewriter'
import { assets } from '../lib/assets'

type FieldName = 'name' | 'email' | 'phone' | 'farm' | 'message'

// 五个字段的标签、占位符、必填与否照 arceage-contact-us prompt 原文
const FIELDS: { name: FieldName; label: string; type: string; placeholder: string; required: boolean }[] = [
  { name: 'name', label: 'Your Name*', type: 'text', placeholder: "Who's reaching out?", required: true },
  { name: 'email', label: 'Email*', type: 'email', placeholder: 'Where can we reach you?', required: true },
  { name: 'phone', label: 'Phone Number*', type: 'tel', placeholder: 'Best number to call you on?', required: true },
  { name: 'farm', label: 'Farm / Company', type: 'text', placeholder: 'Your farm or organization?', required: false },
  {
    name: 'message',
    label: 'Tell Us More',
    type: 'text',
    placeholder: 'What crops or acreage would you like to discuss?',
    required: false,
  },
]

const EMPTY = { name: '', email: '', phone: '', farm: '', message: '' }
const UNTOUCHED = { name: false, email: false, phone: false, farm: false, message: false }

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

function maskStyle(url: string) {
  return {
    WebkitMaskImage: `url(${url})`,
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskImage: `url(${url})`,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
  }
}

export default function Contact() {
  const [formData, setFormData] = useState(EMPTY)
  const [touched, setTouched] = useState(UNTOUCHED)

  const validations: Record<FieldName, boolean> = {
    name: formData.name.trim().length > 0,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    phone: /^\+[\d\s\-()]{7,20}$/.test(formData.phone),
    farm: formData.farm.trim().length > 0,
    message: formData.message.trim().length > 0,
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))

  const renderIcon = (field: FieldName, isRequired: boolean) => {
    if (!touched[field]) return null
    const valid = validations[field]
    if (valid && (isRequired || formData[field].length > 0)) {
      return (
        <div
          className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 bg-[#27BD09]"
          style={maskStyle(assets.icon.valid)}
          role="img"
          aria-label="Valid"
        />
      )
    }
    if (!valid && isRequired) {
      return (
        <div
          className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 bg-[#FF1F1F]"
          style={maskStyle(assets.icon.invalid)}
          role="img"
          aria-label="Invalid"
        />
      )
    }
    return null
  }

  return (
    // prompt 明写:页面壳是 bg-black,本区块覆写为 bg-white text-black
    <section
      id="contact"
      className="flex w-full flex-col items-center justify-center bg-white px-6 py-24 text-black md:px-12 lg:px-[120px]"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        className="mx-auto flex w-full max-w-3xl flex-col items-center"
      >
        <div className="mb-16 w-full text-center">
          <h2 className="mb-6 text-[clamp(1.5rem,4vw,3.5rem)] font-medium leading-[1.1] tracking-tight">
            <span className="font-accent font-normal italic text-black">
              <Typewriter text="Let's grow!" speed={0.012} />
            </span>{' '}
            <Typewriter text="Fill in the form" delay={0.2} speed={0.012} />
            <br />
            <Typewriter text="and we'll be in touch" delay={0.4} speed={0.012} />
          </h2>
          <p className="text-lg text-gray-800 md:text-xl">
            <Typewriter text="Ask us about our precision harvesting services" delay={0.6} speed={0.012} />
          </p>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto flex w-full max-w-2xl flex-col gap-8"
          noValidate
        >
          {FIELDS.map((field) => (
            <motion.div
              key={field.name}
              variants={formVariants}
              className="flex flex-col gap-2 border-b border-[#D9D9D9] pb-2 transition-colors duration-300 hover:border-black focus-within:border-black"
            >
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </label>
              <div className="relative w-full">
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full bg-transparent pr-8 text-base outline-none transition-colors duration-300 placeholder:text-[#D9D9D9] focus:placeholder:text-gray-500"
                />
                {renderIcon(field.name, field.required)}
              </div>
            </motion.div>
          ))}

          <motion.div variants={formVariants} className="mt-8 flex justify-center">
            <button
              type="submit"
              className="rounded-full bg-black px-6 py-2.5 text-sm tracking-wide text-white transition-colors duration-300 hover:bg-[#27BD09]"
            >
              Send Message
            </button>
          </motion.div>
        </form>
      </motion.div>
    </section>
  )
}

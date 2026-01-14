import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"

type ScrollOrbProps = {
	size?: number
	backgroundImage: string
}

const DEFAULT_SIZE = 330

const isCoarsePointer = () =>
	window.matchMedia("(pointer: coarse)").matches ||
	window.matchMedia("(hover: none)").matches

const ScrollOrb = ({ size = DEFAULT_SIZE, backgroundImage }: ScrollOrbProps) => {
	const orbRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (isCoarsePointer()) return
		const orb = orbRef.current
		if (!orb) return
		const orbBg = orb.querySelector<HTMLDivElement>(".cursor-ring__bg")
		if (!orbBg) return

		const backgroundSource =
			document.querySelector<HTMLElement>("[data-cursor-ring-source]") ??
			document.body
		const getBackgroundStyles = () => getComputedStyle(backgroundSource)
		let backgroundStyles = getBackgroundStyles()

		const updateBackgroundBase = () => {
			backgroundStyles = getBackgroundStyles()
			const computedImage =
				backgroundStyles.backgroundImage !== "none"
					? backgroundStyles.backgroundImage
					: `url(${backgroundImage})`

			orbBg.style.backgroundImage = computedImage
			orbBg.style.backgroundRepeat = backgroundStyles.backgroundRepeat
			orbBg.style.backgroundAttachment =
				backgroundStyles.backgroundAttachment
		}

		const target = {
			x: window.innerWidth * 0.7,
			y: window.innerHeight * 0.25,
			active: 1,
		}
		const current = { ...target }
		const easing = 0.12
		let rafId: number | null = null

		const metrics = {
			imageWidth: 0,
			imageHeight: 0,
			drawnWidth: 0,
			drawnHeight: 0,
			offsetX: 0,
			offsetY: 0,
			containerWidth: 0,
			containerHeight: 0,
			isFixedAttachment: false,
		}

		const extractImageUrl = (value: string) => {
			const match = value.match(/url\(["']?(.*?)["']?\)/)
			return match ? match[1] : ""
		}

		const resolvePositionToken = (token: string) => {
			if (!token) return { type: "percent" as const, value: 0.5 }
			if (token === "center")
				return { type: "percent" as const, value: 0.5 }
			if (token === "left" || token === "top")
				return { type: "percent" as const, value: 0 }
			if (token === "right" || token === "bottom")
				return { type: "percent" as const, value: 1 }
			if (token.endsWith("%"))
				return {
					type: "percent" as const,
					value: parseFloat(token) / 100,
				}
			if (token.endsWith("px"))
				return { type: "px" as const, value: parseFloat(token) }
			const numeric = Number.parseFloat(token)
			if (!Number.isNaN(numeric))
				return { type: "px" as const, value: numeric }
			return { type: "percent" as const, value: 0.5 }
		}

		const resolveOffset = (
			token: string,
			containerSize: number,
			drawnSize: number
		) => {
			const parsed = resolvePositionToken(token)
			if (parsed.type === "px") return parsed.value
			return (containerSize - drawnSize) * parsed.value
		}

		const resolveSizeToken = (
			token: string,
			containerSize: number,
			imageSize: number
		) => {
			if (!token || token === "auto") return "auto"
			if (token.endsWith("%"))
				return (containerSize * parseFloat(token)) / 100
			if (token.endsWith("px")) return parseFloat(token)
			if (token === "cover" || token === "contain") return token
			const numeric = Number.parseFloat(token)
			if (!Number.isNaN(numeric)) return numeric
			return imageSize || containerSize
		}

		const computeDrawnSize = (
			containerWidth: number,
			containerHeight: number
		) => {
			const backgroundSize = backgroundStyles.backgroundSize.trim()
			if (!metrics.imageWidth || !metrics.imageHeight) {
				metrics.drawnWidth = containerWidth
				metrics.drawnHeight = containerHeight
				return
			}

			if (backgroundSize === "cover") {
				const scale = Math.max(
					containerWidth / metrics.imageWidth,
					containerHeight / metrics.imageHeight
				)
				metrics.drawnWidth = metrics.imageWidth * scale
				metrics.drawnHeight = metrics.imageHeight * scale
				return
			}

			if (backgroundSize === "contain") {
				const scale = Math.min(
					containerWidth / metrics.imageWidth,
					containerHeight / metrics.imageHeight
				)
				metrics.drawnWidth = metrics.imageWidth * scale
				metrics.drawnHeight = metrics.imageHeight * scale
				return
			}

			const parts = backgroundSize.split(/\s+/)
			const sizeX = resolveSizeToken(
				parts[0],
				containerWidth,
				metrics.imageWidth
			)
			const sizeY = resolveSizeToken(
				parts[1] ?? "auto",
				containerHeight,
				metrics.imageHeight
			)
			const ratio = metrics.imageWidth / metrics.imageHeight

			if (sizeX === "auto" && sizeY === "auto") {
				metrics.drawnWidth = metrics.imageWidth
				metrics.drawnHeight = metrics.imageHeight
				return
			}

			if (sizeX === "auto" && typeof sizeY === "number") {
				metrics.drawnHeight = sizeY
				metrics.drawnWidth = sizeY * ratio
				return
			}

			if (sizeY === "auto" && typeof sizeX === "number") {
				metrics.drawnWidth = sizeX
				metrics.drawnHeight = sizeX / ratio
				return
			}

			if (typeof sizeX === "number" && typeof sizeY === "number") {
				metrics.drawnWidth = sizeX
				metrics.drawnHeight = sizeY
			}
		}

		const updateMetrics = () => {
			updateBackgroundBase()
			const rect = backgroundSource.getBoundingClientRect()
			metrics.isFixedAttachment =
				backgroundStyles.backgroundAttachment === "fixed"
			metrics.containerWidth = metrics.isFixedAttachment
				? window.innerWidth
				: rect.width
			metrics.containerHeight = metrics.isFixedAttachment
				? window.innerHeight
				: rect.height

			computeDrawnSize(metrics.containerWidth, metrics.containerHeight)

			const positionTokens =
				backgroundStyles.backgroundPosition.split(/\s+/)
			const posXToken = positionTokens[0] ?? "50%"
			const posYToken = positionTokens[1] ?? "50%"
			metrics.offsetX = resolveOffset(
				posXToken,
				metrics.containerWidth,
				metrics.drawnWidth
			)
			metrics.offsetY = resolveOffset(
				posYToken,
				metrics.containerHeight,
				metrics.drawnHeight
			)

			orbBg.style.backgroundSize = `${metrics.drawnWidth}px ${metrics.drawnHeight}px`
		}

		const updateBackgroundPosition = () => {
			const rect = backgroundSource.getBoundingClientRect()
			const localX = metrics.isFixedAttachment
				? current.x
				: current.x - rect.left
			const localY = metrics.isFixedAttachment
				? current.y
				: current.y - rect.top
			const bgX = metrics.offsetX - localX + size / 2
			const bgY = metrics.offsetY - localY + size / 2
			orbBg.style.backgroundPosition = `${bgX}px ${bgY}px`
		}

		const image = new Image()
		image.onload = () => {
			metrics.imageWidth = image.naturalWidth
			metrics.imageHeight = image.naturalHeight
			updateMetrics()
		}
		image.onerror = () => {
			updateMetrics()
		}
		const imageUrl = extractImageUrl(backgroundStyles.backgroundImage)
		if (imageUrl) {
			image.src = imageUrl
		} else if (backgroundImage) {
			image.src = backgroundImage
		}

		updateMetrics()

		const applyPosition = () => {
			const nextX = current.x + (target.x - current.x) * easing
			const nextY = current.y + (target.y - current.y) * easing
			const nextActive =
				current.active + (target.active - current.active) * easing

			current.x = nextX
			current.y = nextY
			current.active = nextActive

			orb.style.transform = `translate3d(${nextX - size / 2}px, ${
				nextY - size / 2
			}px, 0)`
			orb.style.setProperty("--cursor-active", `${nextActive}`)
			updateBackgroundPosition()

			const isSettled =
				Math.abs(nextX - target.x) < 0.3 &&
				Math.abs(nextY - target.y) < 0.3

			if (isSettled) {
				current.x = target.x
				current.y = target.y
				current.active = target.active
				orb.style.transform = `translate3d(${target.x - size / 2}px, ${
					target.y - size / 2
				}px, 0)`
				orb.style.setProperty("--cursor-active", `${target.active}`)
				updateBackgroundPosition()
				rafId = null
				return
			}

			rafId = requestAnimationFrame(applyPosition)
		}

		const scheduleUpdate = () => {
			if (rafId !== null) return
			rafId = requestAnimationFrame(applyPosition)
		}

		const updateTarget = () => {
			const scrollTop = window.scrollY
			const amplitude = Math.min(220, window.innerWidth * 0.25)
			const centerX = window.innerWidth / 2
			const centerY = window.innerHeight / 2
			const wavelength = Math.max(window.innerHeight * 1.2, 1)
			const phase = (scrollTop / wavelength) * Math.PI * 2
			target.x = centerX + Math.sin(phase) * amplitude
			target.y = centerY
			target.active = 1
			scheduleUpdate()
		}

		const handleScroll = () => {
			updateTarget()
		}

		const handleResize = () => {
			updateMetrics()
			updateTarget()
		}

		updateTarget()

		window.addEventListener("scroll", handleScroll, { passive: true })
		window.addEventListener("resize", handleResize)

		return () => {
			if (rafId !== null) cancelAnimationFrame(rafId)
			window.removeEventListener("scroll", handleScroll)
			window.removeEventListener("resize", handleResize)
		}
	}, [size, backgroundImage])

	if (typeof window !== "undefined" && isCoarsePointer()) {
		return null
	}

	return (
		<div
			ref={orbRef}
			className="scroll-orb mirror-orb"
			aria-hidden="true"
			style={
				{
					"--cursor-ring-size": `${size}px`,
				} as CSSProperties
			}
		>
			<div className="cursor-ring__bg" />
		</div>
	)
}

export default ScrollOrb

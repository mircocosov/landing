import { useCallback, useEffect, useRef } from "react"
import type { CSSProperties, PointerEvent, ReactNode } from "react"
import styles from "./SpotlightBackground.module.scss"

const DEFAULT_RADIUS = 180
const DEFAULT_FADE = 80

type SpotlightVars = {
	x: number
	y: number
	radius: number
	fade: number
}

type SpotlightBackgroundProps = {
	imageUrl: string
	radius?: number
	fade?: number
	className?: string
	children?: ReactNode
}

const setCssVars = (
	node: HTMLElement | null,
	{ x, y, radius, fade }: SpotlightVars
) => {
	if (!node) return
	node.style.setProperty("--mx", `${x}px`)
	node.style.setProperty("--my", `${y}px`)
	node.style.setProperty("--r", `${radius}px`)
	node.style.setProperty("--fade", `${fade}px`)
}

const SpotlightBackground = ({
	imageUrl,
	radius = DEFAULT_RADIUS,
	fade = DEFAULT_FADE,
	className = "",
	children,
}: SpotlightBackgroundProps) => {
	const wrapRef = useRef<HTMLDivElement | null>(null)
	const rafIdRef = useRef<number | null>(null)
	const latestPointRef = useRef({ x: -9999, y: -9999 })

	const applyPosition = useCallback(() => {
		rafIdRef.current = null
		const node = wrapRef.current
		if (!node) return
		const { x, y } = latestPointRef.current
		setCssVars(node, { x, y, radius, fade })
	}, [radius, fade])

	const scheduleUpdate = useCallback(() => {
		if (rafIdRef.current !== null) return
		rafIdRef.current = requestAnimationFrame(applyPosition)
	}, [applyPosition])

	const handlePointerMove = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			const node = wrapRef.current
			if (!node) return
			const rect = node.getBoundingClientRect()
			latestPointRef.current = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			}
			scheduleUpdate()
		},
		[scheduleUpdate]
	)

	const handlePointerLeave = useCallback(() => {
		latestPointRef.current = { x: -9999, y: -9999 }
		scheduleUpdate()
	}, [scheduleUpdate])

	useEffect(
		() => () => {
			if (rafIdRef.current !== null)
				cancelAnimationFrame(rafIdRef.current)
		},
		[]
	)

	useEffect(() => {
		const node = wrapRef.current
		if (!node) return
		const rect = node.getBoundingClientRect()
		const centerX = rect.width / 2
		const centerY = rect.height / 2
		latestPointRef.current = { x: centerX, y: centerY }
		setCssVars(node, { x: centerX, y: centerY, radius, fade })
	}, [radius, fade])

	const styleVars: CSSProperties = {
		"--bg-url": `url(${imageUrl})`,
		"--r": `${radius}px`,
		"--fade": `${fade}px`,
	} as CSSProperties

	return (
		<div
			className={`${styles.wrap} ${className}`.trim()}
			ref={wrapRef}
			onPointerMove={handlePointerMove}
			onPointerDown={handlePointerMove}
			onPointerLeave={handlePointerLeave}
			style={styleVars}
		>
			<div className={styles.milk} />
			<div className={styles.photo} />
			<div className={styles.content}>{children}</div>
		</div>
	)
}

export default SpotlightBackground

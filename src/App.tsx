import { memo, useCallback, useState } from "react"
import type { MouseEvent, PointerEvent, ReactNode } from "react"
import "./App.scss"
import CursorRing from "./components/CursorRing.tsx"
import SpotlightBackground from "./components/SpotlightBackground.tsx"

const dasha1Image = "/dasha1.jpg"
const dasha2Image = "/dasha2.jpg"
const dasha3Image = "/dasha3.jpg"

type ScheduleEntry = {
	day: string
	type: string
	color: "pink" | "purple"
}

type LinkHandler = (event: MouseEvent<HTMLAnchorElement>) => void

type LeavingHomeProps = {
	isLeavingHome: boolean
}

type PlatformsSectionProps = {
	handleLinkClick: LinkHandler
}

type NeonButtonProps = {
	icon: string
	text: string
	href: string
	color: "pink" | "purple"
	onClick: LinkHandler
}

type SectionTitleProps = {
	children: ReactNode
	icon: string
}

type FeatureCardProps = {
	icon: string
	title: string
	description: string
	color: "pink" | "purple"
}

type PlatformCardProps = {
	platform: string
	icon: string
	description: string
	image: string
	color: "pink" | "purple"
	link: string
	onClick: LinkHandler
}

type ScheduleItemProps = {
	day: string
	type: string
	color: "pink" | "purple"
	delay: number
}

type SocialLinkProps = {
	icon: string
	href: string
	color: "pink" | "purple"
	onClick: LinkHandler
}

const schedule: ScheduleEntry[] = [
	{
		day: "понедельник",
		type: "общение/просмотр заказов",
		color: "pink",
	},
	{
		day: "вторник",
		type: "общение/просмотр заказов",
		color: "purple",
	},
	{ day: "среда", type: "общение/просмотр заказов", color: "pink" },
	{ day: "пятница", type: "игровой стрим", color: "purple" },
	{ day: "суббота", type: "киноаукцион", color: "pink" },
	{ day: "воскресенье", type: "игровой стрим", color: "purple" },
]

export default function App() {
	const [isLeavingHome] = useState(false)

	const handleLinkClick = useCallback(
		(event: MouseEvent<HTMLAnchorElement>) => {
			event.preventDefault()
			const href = event.currentTarget.getAttribute("href")
			if (href && href.startsWith("http")) {
				window.open(href, "_blank")
			}
		},
		[]
	)

	const handlePointerMove = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			const target = event.currentTarget
			target.style.setProperty("--cursor-x", `${event.clientX}px`)
			target.style.setProperty("--cursor-y", `${event.clientY}px`)
			target.style.setProperty("--cursor-active", "1")
		},
		[]
	)

	const handlePointerLeave = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			const target = event.currentTarget
			target.style.setProperty("--cursor-active", "0")
		},
		[]
	)

	return (
		<SpotlightBackground
			imageUrl="/background.png"
			className={`home-page-neon ${
				isLeavingHome ? "home-page-leaving" : ""
			}`}
			style={{ backgroundColor: "#f6f1e8" }}
			onPointerMove={handlePointerMove}
			onPointerLeave={handlePointerLeave}
		>
			<CursorRing backgroundImage="/background.png" />
			<div className="home-cursor-glow" aria-hidden="true" />
			<BackgroundTransitionOverlay isLeavingHome={isLeavingHome} />
			<FloatingParticles isLeavingHome={isLeavingHome} />
			<NeonGrid isLeavingHome={isLeavingHome} />

			<section className="home-hero-section">
				<div className="home-hero-content">
					<div className="home-hero-title-wrapper">
						<div className="home-hero-glow-1" />
						<div className="home-hero-glow-2" />
						<h1 className="home-hero-title">
							<span className="home-hero-title-gradient">
								euphoria room
							</span>
						</h1>
					</div>

					<p className="home-hero-subtitle">
						погрузись в атмосферу стримов,
						<br className="home-hero-br" />
						где каждый момент —{" "}
						<span className="home-hero-accent">эйфория</span>
					</p>

					<div className="home-hero-buttons">
						<NeonButton
							icon="🕹️"
							text="TWITCH"
							href="https://twitch.tv/euphoria_room"
							color="purple"
							onClick={handleLinkClick}
						/>
						<NeonButton
							icon="🎥"
							text="VK ВИДЕО"
							href="https://live.vkplay.ru/euphoria_room"
							color="pink"
							onClick={handleLinkClick}
						/>
					</div>
				</div>
			</section>

			<AboutSection />
			<PlatformsSection handleLinkClick={handleLinkClick} />
			<ScheduleSection />
			<CommunitySection handleLinkClick={handleLinkClick} />
			<FooterSection handleLinkClick={handleLinkClick} />
		</SpotlightBackground>
	)
}

const BackgroundTransitionOverlay = memo(
	({ isLeavingHome }: LeavingHomeProps) =>
		isLeavingHome ? <div className="home-background-transition" /> : null
)

const FloatingParticles = memo(({ isLeavingHome }: LeavingHomeProps) => (
	<div
		className={`home-floating-particles ${
			isLeavingHome ? "home-floating-particles-hidden" : ""
		}`}
	>
		{Array.from({ length: 28 }, (_, i) => (
			<div key={i} className="home-floating-particle" />
		))}
	</div>
))

const NeonGrid = memo(({ isLeavingHome }: LeavingHomeProps) => (
	<div
		className={`home-neon-grid ${
			isLeavingHome ? "home-neon-grid-hidden" : ""
		}`}
	>
		<div className="home-neon-grid-vertical">
			{Array.from({ length: 15 }, (_, i) => (
				<div
					key={`v-${i}`}
					className="home-neon-grid-line home-neon-grid-line-vertical"
				/>
			))}
		</div>
		<div className="home-neon-grid-horizontal">
			{Array.from({ length: 15 }, (_, i) => (
				<div
					key={`h-${i}`}
					className="home-neon-grid-line home-neon-grid-line-horizontal"
				/>
			))}
		</div>
	</div>
))

const AboutSection = memo(() => (
	<section>
		<div className="home-section-container">
			<SectionTitle icon="✨">атмосфера стрима</SectionTitle>
			<div className="home-features-grid">
				<FeatureCard
					icon="🎧"
					title="chill vibes"
					description="расслабляющая атмосфера, где можно отдохнуть от суеты и насладиться спокойным общением"
					color="purple"
				/>
				<FeatureCard
					icon="💖"
					title="тёплое комьюнити"
					description="дружная компания, где каждый найдёт своё место и почувствует себя как дома"
					color="pink"
				/>
			</div>
		</div>
	</section>
))

const PlatformsSection = memo(({ handleLinkClick }: PlatformsSectionProps) => (
	<section>
		<div className="home-section-container">
			<SectionTitle icon="🧭">где меня найти</SectionTitle>
			<div className="home-platforms-grid">
				<PlatformCard
					platform="Twitch"
					icon="🕹️"
					description="основная площадка для стримов с интерактивным чатом"
					image={dasha1Image}
					color="purple"
					link="https://twitch.tv/euphoria_room"
					onClick={handleLinkClick}
				/>
				<PlatformCard
					platform="VK Видео"
					icon="🎥"
					description="альтернативная площадка и записи стримов"
					image={dasha2Image}
					color="pink"
					link="https://live.vkplay.ru/euphoria_room"
					onClick={handleLinkClick}
				/>
				<PlatformCard
					platform="Boosty"
					icon="🌟"
					description="косплеи, влоги из жизни и другой эксклюзивный контент"
					image={dasha3Image}
					color="purple"
					link="https://boosty.to/euphoria_room"
					onClick={handleLinkClick}
				/>
			</div>
		</div>
	</section>
))

const ScheduleSection = memo(() => (
	<section>
		<div className="home-section-container home-section-schedule">
			<SectionTitle icon="🗓️">расписание</SectionTitle>
			<div className="home-schedule-list">
				{schedule.map((stream, index) => (
					<ScheduleItem
						key={index}
						{...stream}
						delay={index * 0.15}
					/>
				))}
			</div>
		</div>
	</section>
))

const CommunitySection = memo(({ handleLinkClick }: PlatformsSectionProps) => (
	<section>
		<div className="home-section-container">
			<SectionTitle icon="🤝">вайб комьюнити</SectionTitle>
			<div className="home-community-wrapper">
				<div className="home-community-card">
					<div className="home-community-border" />
					<div className="home-community-content">
						<p className="home-community-text">
							Мы создаём пространство, где можно расслабиться,
							пообщаться и просто быть собой.
							<br />
							<span className="home-community-accent">
								Здесь нет токсичности
							</span>{" "}
							— только приятная атмосфера и позитивная энергия.
						</p>
						<div className="home-community-cta">
							<a
								href="https://t.me/ethiopia_room"
								target="_blank"
								rel="noopener noreferrer"
								className="home-community-cta-card"
								onClick={handleLinkClick}
							>
								<span className="home-community-cta-icon">
									💌
								</span>
								<span className="home-community-cta-text">
									присоединяйся к нам
								</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
))

const FooterSection = memo(({ handleLinkClick }: PlatformsSectionProps) => (
	<footer className="home-footer">
		<div className="home-footer-container">
			<div className="home-footer-content">
				<div className="home-footer-line" />
				<h2 className="home-footer-title">
					<span className="home-footer-title-gradient">
						euphoria room
					</span>
				</h2>
				<p className="home-footer-subtitle">ловим вайб каждый день</p>
				<div className="home-footer-social">
					<SocialLink
						icon="🕹️"
						href="https://twitch.tv/euphoria_room"
						color="purple"
						onClick={handleLinkClick}
					/>
					<SocialLink
						icon="🎥"
						href="https://live.vkplay.ru/euphoria_room"
						color="pink"
						onClick={handleLinkClick}
					/>
					<SocialLink
						icon="💬"
						href="https://t.me/ethiopia_room"
						color="purple"
						onClick={handleLinkClick}
					/>
				</div>
				<a
					className="home-footer-copyright"
					href="https://t.me/mircocosov"
					target="_blank"
					rel="noopener noreferrer"
					onClick={handleLinkClick}
				>
					© 2025 mircocosov
				</a>
			</div>
		</div>
	</footer>
))

function NeonButton({ icon, text, href, color, onClick }: NeonButtonProps) {
	return (
		<div className="home-neon-button-wrapper">
			<div
				className={`home-neon-button-glow home-neon-button-glow-${color}`}
			/>
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={`home-neon-button home-neon-button-${color}`}
				onClick={onClick}
			>
				<span className="home-button-icon">{icon}</span>
				<span className="home-neon-button-text">{text}</span>
				<span className="home-neon-button-external">↗</span>
			</a>
		</div>
	)
}

function SectionTitle({ children, icon }: SectionTitleProps) {
	return (
		<div className="home-section-title-wrapper">
			<div className="home-section-icon-wrapper">{icon}</div>
			<h2 className="home-section-title">
				<span className="home-section-title-gradient">{children}</span>
			</h2>
		</div>
	)
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
	return (
		<div className={`home-feature-card home-feature-card-${color}`}>
			<div
				className={`home-feature-card-bg home-feature-card-bg-${color}`}
			/>
			<div
				className={`home-feature-icon-wrapper home-feature-icon-wrapper-${color}`}
			>
				{icon}
			</div>
			<h3 className="home-feature-title">{title}</h3>
			<p className="home-feature-description">{description}</p>
		</div>
	)
}

function PlatformCard({
	platform,
	icon,
	description,
	image,
	color,
	link,
	onClick,
}: PlatformCardProps) {
	const [isHovered, setIsHovered] = useState(false)

	return (
		<a
			href={link}
			target="_blank"
			rel="noopener noreferrer"
			className="home-platform-card"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
		>
			<div className="home-platform-bg">
				<img
					src={image}
					alt={platform}
					className="home-platform-image"
					style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
				/>
				<div className="home-platform-overlay" />
			</div>

			<div
				className={`home-platform-border home-platform-border-${color}`}
				style={{
					boxShadow: isHovered
						? color === "purple"
							? "0 0 30px 2px rgba(139, 92, 246, 0.6)"
							: "0 0 30px 2px rgba(236, 72, 153, 0.6)"
						: "0 0 0 2px transparent",
				}}
			/>

			<div className="home-platform-content">
				<div
					className={`home-platform-icon-wrapper home-platform-icon-wrapper-${color}`}
					style={{
						transform: isHovered
							? "scale(1.15) rotate(8deg)"
							: "scale(1) rotate(0)",
					}}
				>
					{icon}
				</div>
				<h3 className="home-platform-name">{platform}</h3>
				<p className="home-platform-description">{description}</p>
			</div>
		</a>
	)
}

function ScheduleItem({ day, type, color, delay }: ScheduleItemProps) {
	return (
		<div
			className="home-schedule-item"
			style={{ animationDelay: `${delay}s` }}
		>
			<div className={`home-schedule-line home-schedule-line-${color}`} />
			<div className="home-schedule-content">
				<div
					className={`home-schedule-icon-wrapper home-schedule-icon-wrapper-${color}`}
				>
					<span className="home-schedule-icon">🗓️</span>
				</div>
				<div>
					<h4 className="home-schedule-day">{day}</h4>
					<p
						className={`home-schedule-type home-schedule-type-${color}`}
					>
						{type}
					</p>
				</div>
			</div>
		</div>
	)
}

function SocialLink({ icon, href, color, onClick }: SocialLinkProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="home-social-link"
			onClick={onClick}
		>
			<div className={`home-social-glow home-social-glow-${color}`} />
			<div className={`home-social-icon home-social-icon-${color}`}>
				{icon}
			</div>
		</a>
	)
}

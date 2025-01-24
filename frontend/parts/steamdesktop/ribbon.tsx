import type { FC, ReactNode } from "react";
import { IconButton } from "../../components/iconbutton";
import { BuildClassName, PartComponentBase } from "../../shared";

interface RibbonButtonProps {
	disabled?: boolean;
	/** Icon name for {@link IconButton}. */
	icon: string;
	/** Localization token. */
	text: string;
	/** Vertical layout? */
	vertical?: boolean;
	onArrowClick?: () => void;
	onClick: () => void;
}

export function RibbonButton(props: RibbonButtonProps) {
	const { disabled, icon, text, vertical, onClick, onArrowClick } = props;
	const strContainerClassName = BuildClassName([
		"ribbon-button-container",
		disabled && "disabled",
		vertical && "vertical",
	]);
	const strArrowClassName = BuildClassName([
		"ribbon-button-arrow",
		vertical && "vertical",
	]);

	return (
		<div id={text.replace("#", "")} className={strContainerClassName}>
			<div
				className="ribbon-button"
				onClick={onClick}
				onContextMenu={onArrowClick}
			>
				<IconButton name={icon} />
				{LocalizationManager.LocalizeIfToken(text)}
			</div>
			{onArrowClick && (
				<div className={strArrowClassName} onClick={onArrowClick} />
			)}
		</div>
	);
}

interface RibbonSectionProps {
	children: ReactNode;
	title: string;
}

export const RibbonSection: FC<RibbonSectionProps> = ({ children, title }) => (
	<div className="ribbon-section">
		<div className="ribbon-section-body">{children}</div>
		<div className="ribbon-section-title">{title}</div>
	</div>
);

interface RibbonContainerProps {
	children?: ReactNode;
}

export const RibbonContainer: FC<RibbonContainerProps> = ({ children }) => (
	<div className="ribbon-sections-container">{children}</div>
);

interface RibbonGameSectionButtonProps {
	appid: number;
}

// biome-ignore lint/complexity/noBannedTypes: stfu
export class RibbonGameSectionButton<S = {}> extends PartComponentBase<
	S,
	RibbonGameSectionButtonProps
> {}

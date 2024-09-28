import type { CSSProperties, HTMLAttributes } from "react";

interface IconButtonProps {
	strIconName: string;
}

// @ts-ignore ts(2686) because ts is retarded
export class IconButton extends React.Component<
	IconButtonProps & HTMLAttributes<HTMLDivElement>
> {
	render() {
		const { strIconName } = this.props;

		return (
			<div
				{...this.props}
				className="icon-button"
				style={{ "--icon": `var(--icon-${strIconName})` } as CSSProperties}
			/>
		);
	}
}

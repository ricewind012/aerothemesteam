const k_strLogStyle = "color: white; padding: 0 1ch";
const k_strThemeName = "aerothemesteam";

export class CLog {
	public m_strScope: string;

	constructor(strScope: string) {
		this.m_strScope = strScope;
	}

	#Print(strMethod: string, strFormat: string, ...args: any[]) {
		console[strMethod](
			`%c${k_strThemeName}%c${this.m_strScope}%c ${strFormat}`,
			`${k_strLogStyle}; background-color: black`,
			`${k_strLogStyle}; background-color: #151515`,
			"",
			...args,
		);
	}

	Log(strFormat: string, ...args: any[]) {
		this.#Print("log", strFormat, ...args);
	}

	Warn(strFormat: string, ...args: any[]) {
		this.#Print("warn", strFormat, ...args);
	}

	Error(strFormat: string, ...args: any[]) {
		this.#Print("error", strFormat, ...args);
	}

	Assert(bAssertion: boolean, strFormat: string, ...args: any[]) {
		if (bAssertion) {
			return;
		}

		this.Error(`Assertion failed: ${strFormat}`, ...args);
	}
}

export class CLogTime extends CLog {
	m_strLabel: string;
	m_unDate: number;

	constructor(strScope: string, strLabel: string) {
		super(strScope);

		this.m_strLabel = strLabel;
	}

	TimeStart() {
		this.m_unDate = Number(new Date());
	}

	TimeEnd() {
		const pCurrentDate = Number(new Date());

		this.Log(
			"%s: took %o seconds",
			this.m_strLabel,
			(pCurrentDate - this.m_unDate) / 1000,
		);
	}
}

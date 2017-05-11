setInterval(function(){ ProcessClock(); }, 10);

var m_szClockMode = "CLOCKMODE_NL";
var m_nClockFramesPassed = 0;
var ms_bStopwatchEnabled = false;
var ms_bStopwatchInitialized = false;
var m_nStopwatchTimer = 0;
var ms_bShouldCountStopwatch = false;
var ms_bClockInLoadingStage = true;
var m_bInitialLoadingModePassed = false;

function ProcessClock()
{
	var m_szTimeString = "";
	m_nClockFramesPassed++;
	var m_CurrDate = new Date();

	if (!m_bInitialLoadingModePassed)
	{
		SwitchToLoadingMode(true);
		m_bInitialLoadingModePassed = true;
	}

	// Standaard klok - met of zonder stopwatch
	if ((m_nClockFramesPassed % 100) == 99)
	{
		if (ms_bClockInLoadingStage)
		{
			SwitchToLoadingMode(false);
		}

		switch (m_szClockMode)
		{
			case 'CLOCKMODE_NL':
			m_szTimeString = "";
			document.querySelector("#clock-time-text-date").innerHTML = getDayName(m_CurrDate.getDay()) + " " + FormatClockNumber(m_CurrDate.getDate()) + " " + getMonthName(m_CurrDate.getMonth()) + " " + " " + m_CurrDate.getFullYear();
			m_szTimeString += FormatClockNumber(m_CurrDate.getHours()) + ":" + FormatClockNumber(m_CurrDate.getMinutes()) + ":" + FormatClockNumber(m_CurrDate.getSeconds());
			document.querySelector("#clock-time-text").innerHTML = m_szTimeString;
			if (m_CurrDate.getHours() > 19 || m_CurrDate.getHours() < 6)
			{
				document.querySelector("#clock-time-text-date").style.textShadow = "0 0 10px red, 0 0 10px red";
				document.querySelector("#clock-h1").style.textShadow = "0 0 10px red, 0 0 10px red";
				document.querySelector("#clock-time-text").style.textShadow = "0 0 20px red, 0 0 20px red";
			}
			else
			{
				document.querySelector("#clock-time-text-date").style.textShadow = "none";
				document.querySelector("#clock-h1").style.textShadow = "none";
				document.querySelector("#clock-time-text").style.textShadow = "none";				
			}
			break;
			case 'CLOCKMODE_VS':
			m_szTimeString = "";
			m_szVSHour = "";
			var m_bShouldBeAM;
			if (m_CurrDate.getHours() < 12)
			{
				m_bShouldBeAM = true;
			}
			else
			{
				m_bShouldBeAM = false;
			}
			if (m_CurrDate.getHours() != 12)
			{
				m_szVSHour = FormatClockNumber(m_CurrDate.getHours() % 12);
			}
			else
			{
				m_szVSHour = FormatClockNumber(m_CurrDate.getHours());
			}

			document.querySelector("#clock-time-text-date").innerHTML = getDayName(m_CurrDate.getDay()) + " " + FormatClockNumber(m_CurrDate.getDate()) + " " + getMonthName(m_CurrDate.getMonth()) + " " + " " + m_CurrDate.getFullYear();
			if (m_bShouldBeAM)
			{
				m_szTimeString += m_szVSHour + ":" + FormatClockNumber(m_CurrDate.getMinutes()) + ":" + FormatClockNumber(m_CurrDate.getSeconds()) + " AM";
			}
			else
			{
				m_szTimeString += m_szVSHour + ":" + FormatClockNumber(m_CurrDate.getMinutes()) + ":" + FormatClockNumber(m_CurrDate.getSeconds()) + " PM";
			}
			document.querySelector("#clock-time-text").innerHTML = m_szTimeString;
			if (m_CurrDate.getHours() > 19 || m_CurrDate.getHours() < 6)
			{
				document.querySelector("#clock-time-text-date").style.textShadow = "0 0 10px red, 0 0 10px red";
				document.querySelector("#clock-h1").style.textShadow = "0 0 10px red, 0 0 10px red";
				document.querySelector("#clock-time-text").style.textShadow = "0 0 20px red, 0 0 20px red";
			}
			else
			{
				document.querySelector("#clock-time-text-date").style.textShadow = "none";
				document.querySelector("#clock-h1").style.textShadow = "none";
				document.querySelector("#clock-time-text").style.textShadow = "none";				
			}
			break;
			default:
			break;
		}
	}

	// Stopwatch
	if (ms_bStopwatchEnabled)
	{
		if (ms_bStopwatchInitialized)
		{
			document.querySelector("#clock-stopwatch-time").innerHTML = processStopwatchTime();
		}
		else
		{
			ms_bStopwatchInitialized = true;
		}
		if (m_CurrDate.getHours() > 19 || m_CurrDate.getHours() < 6)
		{
			document.querySelector("#clock-stopwatch-time").style.textShadow = "0 0 7.5px orange, 0 0 7.5px orange";
		}
		else
		{
			document.querySelector("#clock-stopwatch-time").style.textShadow = "none";			
		}
	}
}

function SwitchToLoadingMode(m_bNewLoadingMode)
{
	document.querySelector("body").style.cursor = "wait";
	if (m_bNewLoadingMode)
	{
		document.querySelector("#clock-time-text-date").style.textShadow = "0 0 10px red, 0 0 10px red";
		document.querySelector("#clock-h1").style.textShadow = "0 0 10px red, 0 0 10px red";
		document.querySelector("#clock-time-text").style.textShadow = "0 0 20px red, 0 0 20px red";
		document.querySelector("#clock-time-text-date").innerHTML = "Donderdag 1 Januari 1970";
		document.querySelector("#clock-time-text").innerHTML = "00:00:00";
		document.querySelector("#clock-stopwatch-time").style.textShadow = "0 0 7.5px orange, 0 0 7.5px orange";
		document.querySelector("#clock-stopwatch-time").innerHTML = "Laden...";
		ms_bClockInLoadingStage = m_bNewLoadingMode;
	}
	else
	{
		ms_bClockInLoadingStage = m_bNewLoadingMode;
		document.querySelector("body").style.cursor = "initial";
		document.querySelector("#clock-stopwatch-time").innerHTML = "";
	}

}

function ToggleStopwatch(m_szStopwatchMode)
{
	switch (m_szStopwatchMode)
	{
		case 'STOPWATCH_ON':
		document.querySelector("#clock-stopwatch-time").style.display = "block";
		ms_bStopwatchEnabled = true;
		ms_bStopwatchInitialized = true;
		ms_bShouldCountStopwatch = false;
		m_nStopwatchTimer = 0;
		document.querySelector("#stopwatch-btns").innerHTML = "";
		document.querySelector("#stopwatch-btns").innerHTML += "<button onclick=\"ToggleStopwatch('STOPWATCH_OFF')\">Stopwatch uit</button>";
		document.querySelector("#stopwatch-btns").innerHTML += "<button onclick=\"ToggleStopwatch('STOPWATCH_START')\">Start stopwatch</button>";
		break;
		case 'STOPWATCH_OFF':
		document.querySelector("#clock-stopwatch-time").style.display = "none";
		ms_bStopwatchEnabled = false;
		ms_bStopwatchInitialized = false;
		ms_bShouldCountStopwatch = false;
		m_nStopwatchTimer = 0;
		document.querySelector("#stopwatch-btns").innerHTML = "";
		document.querySelector("#stopwatch-btns").innerHTML += "<button onclick=\"ToggleStopwatch('STOPWATCH_ON')\">Stopwatch aan</button>";
		break;
		case 'STOPWATCH_RESET':
		if (ms_bStopwatchInitialized && ms_bStopwatchEnabled)
		{
			m_nStopwatchTimer = 0;	
			ms_bShouldCountStopwatch = false;
			document.querySelector("#stopwatch-btns").innerHTML = "";
			document.querySelector("#stopwatch-btns").innerHTML += "<button onclick=\"ToggleStopwatch('STOPWATCH_OFF')\">Stopwatch uit</button>";
			document.querySelector("#stopwatch-btns").innerHTML += "<button onclick=\"ToggleStopwatch('STOPWATCH_START')\">Start stopwatch</button>";
		}
		break;
		case 'STOPWATCH_STOP':
		if (ms_bStopwatchInitialized && ms_bStopwatchEnabled && ms_bShouldCountStopwatch)
		{
			ms_bShouldCountStopwatch = false;
			document.querySelector("#stopwatch-btns").innerHTML = "";
			document.querySelector("#stopwatch-btns").innerHTML += "<button onclick=\"ToggleStopwatch('STOPWATCH_OFF')\">Stopwatch uit</button>";
			document.querySelector("#stopwatch-btns").innerHTML += "<button onclick=\"ToggleStopwatch('STOPWATCH_START')\">Start stopwatch</button>";
			document.querySelector("#stopwatch-btns").innerHTML += "<button onclick=\"ToggleStopwatch('STOPWATCH_RESET')\">Reset stopwatch</button>";
		}
		break;
		case 'STOPWATCH_START':
		if (ms_bStopwatchInitialized && ms_bStopwatchEnabled && !ms_bShouldCountStopwatch)
		{
			ms_bShouldCountStopwatch = true;
			document.querySelector("#stopwatch-btns").innerHTML = "";
			document.querySelector("#stopwatch-btns").innerHTML += "<button onclick=\"ToggleStopwatch('STOPWATCH_STOP')\">Stop stopwatch</button>";
		}
	}
}

function SwitchClockmode(m_szNewClockMode)
{
	m_szClockMode = m_szNewClockMode;
}

function FormatClockNumber(n)
{
    return n > 9 ? "" + n: "0" + n;
}

function FormatMillisecondsNumber(n)
{
	if (n < 100)
	{
		return "0" + String(n);
	}
	else
	{
		return String(n);
	}
}

function getDayName(m_nDay)
{
	switch (m_nDay)
	{
		case 0:
		return "Zondag";
		case 1:
		return "Maandag";
		case 2:
		return "Dinsdag";
		case 3:
		return "Woensdag";
		case 4:
		return "Donderdag";
		case 5:
		return "Vrijdag";
		case 6:
		return "Zaterdag";
	}
}

function getMonthName(m_nMonth)
{
	switch (m_nMonth)
	{
		case 0:
		return "Januari";
		case 1:
		return "Februari";
		case 2:
		return "Maart";
		case 3:
		return "April";
		case 4:
		return "Mei";
		case 5:
		return "Juni";
		case 6:
		return "Juli";
		case 7:
		return "Augustus";
		case 8:
		return "September";
		case 9:
		return "Oktober";
		case 10:
		return "November";
		case 11:
		return "December";
	}
}

function isSummertime(m_Date)
{
	var a = m_Date.getMonth();
}

function processStopwatchTime()
{
	var m_szStopwatchString = "";
	if (ms_bShouldCountStopwatch && !ms_bClockInLoadingStage)
	{
		m_nStopwatchTimer++;
	}	
	var m_StopwatchDate = new Date(m_nStopwatchTimer * 10);
	m_szStopwatchString += FormatClockNumber(m_StopwatchDate.getUTCHours()) + ":" + FormatClockNumber(m_StopwatchDate.getMinutes()) + ":" + FormatClockNumber(m_StopwatchDate.getSeconds()) + " " + FormatMillisecondsNumber(m_StopwatchDate.getMilliseconds());
	return m_szStopwatchString; 
}
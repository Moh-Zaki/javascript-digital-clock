setInterval(function(){ ProcessClock(); }, 10);

var m_szClockMode = "CLOCKMODE_NL";
var m_nClockFramesPassed = 0;
var ms_bStopwatchEnabled = false;
var ms_bStopwatchInitialized = false;
var m_nStopwatchTimer = 0;
var ms_bShouldCountStopwatch = false;
var m_bInitialLoadingModePassed = false;

var ms_bInitializedAlarm = false;
var ms_bAlarmSet = false;
var ms_bAlarmGoingOff = false;
var ms_bAlarmOn = false;
var ms_nTargetTime;
var ms_nNumOfLaps = 0;
var ms_nClockFrameStartTime = Date.now();
var ms_nClockFrameCurrentTime = ms_nClockFrameStartTime;

var ms_bHasTimezoneBeenChangedBefore = false;
var m_CurrDate;

var ms_nUTCOffset;

var ms_nTimerSetTime;
var ms_bTimerSet; // ms_nTimerSetTime has a specified time which must be counted down from, and the timer is on
var ms_bTimerOn;
var ms_nTimeOnSet;
var ms_bTimerGoingOff = false;

function ConvertNumberToNegativeNumber(m_nNum)
{
	return m_nNum - (m_nNum * 2);
}

function ConvertNegativeNumberToNumber(m_nNum)
{
	return m_nNum * -1;
}

function ChangeTimezone(m_nUTCOffset, bIsHourOffset)
{
	if (bIsHourOffset)
	{
		m_CurrDate.setHours(m_CurrDate.getUTCHours() + m_nUTCOffset);
	}
	else
	{
		ms_nUTCOffset = m_CurrDate.getTimezoneOffset();
		m_CurrDate.setHours(m_CurrDate.getUTCHours() + ConvertNegativeNumberToNumber(ms_nUTCOffset / 60));
	}
}

function ProcessClock()
{
	var m_szTimeString = "";
	var m_bShouldBeAM = false;
	var m_bShouldBeAlarmAM = false;

	// The clock frames passed according to the difference between the start time and the counter
	// I don't know how far it could drift off if not using Date.now
	// but it will certain drift off somewhat, so even if we keep using the irregular interval of 10ms, it will re-obtain the current Date, so
	// it's irrelevant 
	var a = new Date();
	ms_nClockFrameCurrentTime = Date.now();
	m_nClockFramesPassed = ms_nClockFrameCurrentTime - ms_nClockFrameStartTime;

	m_CurrDate = new Date();

	var m_SelectedTimezone = document.querySelector("#timezone-selector-list").value;
	ChangeTimezone(Number(m_SelectedTimezone), true);

	m_szVSHour = "";
	m_szVSAlarmHour = "";
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

	// Alarm 
	if (ms_bAlarmSet)
	{
		if (ms_nTargetTime.getHours() < 12)
		{
			m_bShouldBeAlarmAM = true;
		}
		else
		{
			m_bShouldBeAlarmAM = false;
		}
		if (ms_nTargetTime.getHours() != 12)
		{
			m_szVSAlarmHour = FormatClockNumber(ms_nTargetTime.getHours() % 12);
		}
		else
		{
			m_szVSAlarmHour = FormatClockNumber(ms_nTargetTime.getHours());
		}
	}

	// If 100 clock frames passed, then update the timer
	if (m_nClockFramesPassed)
	{
		// Alarm going off
		if (ms_bAlarmOn && ms_bAlarmSet)
		{
			if (ms_nTargetTime.getHours() == m_CurrDate.getHours() && ms_nTargetTime.getMinutes() == m_CurrDate.getMinutes())
			{
				ms_bAlarmGoingOff = true;
			}
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
				document.querySelector("#clock-time-text-date").style.textShadow = "0 0 10px rgb(0, 255, 33), 0 0 10px rgb(0, 255, 33)";
				//document.querySelector("#clock-h1").style.textShadow = "0 0 10px rgb(0, 255, 33), 0 0 10px rgb(0, 255, 33)";
				document.querySelector("#clock-time-text").style.textShadow = "0 0 20px rgb(0, 255, 33), 0 0 20px rgb(0, 255, 33)";
			}
			else
			{
				document.querySelector("#clock-time-text-date").style.textShadow = "none";
				//document.querySelector("#clock-h1").style.textShadow = "none";
				document.querySelector("#clock-time-text").style.textShadow = "none";				
			}
			break;
			case 'CLOCKMODE_VS':
			m_szTimeString = "";

			document.querySelector("#clock-time-text-date").innerHTML = getDayName(m_CurrDate.getDay()) + " " + FormatClockNumber(m_CurrDate.getDate()) + " " + getMonthName(m_CurrDate.getMonth()) + " " + " " + m_CurrDate.getFullYear();
			if (m_bShouldBeAM)
			{
				m_szTimeString += m_szVSHour + ":" + FormatClockNumber(m_CurrDate.getMinutes()) + ":" + FormatClockNumber(m_CurrDate.getSeconds()) + " <sup>AM</sup>";
			}
			else
			{
				m_szTimeString += m_szVSHour + ":" + FormatClockNumber(m_CurrDate.getMinutes()) + ":" + FormatClockNumber(m_CurrDate.getSeconds()) + " <sup>PM</sup>";
			}
			document.querySelector("#clock-time-text").innerHTML = m_szTimeString;
			if (m_CurrDate.getHours() > 19 || m_CurrDate.getHours() < 6)
			{
				document.querySelector("#clock-time-text-date").style.textShadow = "0 0 10px rgb(0, 255, 33), 0 0 10px rgb(0, 255, 33)";
				//document.querySelector("#clock-h1").style.textShadow = "0 0 10px rgb(0, 255, 33), 0 0 10px rgb(0, 255, 33)";
				document.querySelector("#clock-time-text").style.textShadow = "0 0 20px rgb(0, 255, 33), 0 0 20px rgb(0, 255, 33)";
			}
			else
			{
				document.querySelector("#clock-time-text-date").style.textShadow = "none";
				//document.querySelector("#clock-h1").style.textShadow = "none";
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
			document.querySelector("#clock-stopwatch-time").style.textShadow = "0 0 7.5px rgb(0, 255, 33), 0 0 7.5px rgb(0, 255, 33)";
		}
		else
		{
			document.querySelector("#clock-stopwatch-time").style.textShadow = "none";			
		}
	}

	// Timer
	if (ms_bTimerSet)
	{
		var m_DifferenceTime = new Date();
		var m_CurrTimeNoTimezone = new Date();
		if (!ms_bTimerGoingOff)
		{
			m_DifferenceTime.setHours((ms_nTimeOnSet.getHours() + ms_nTimerSetTime.getHours()) - m_CurrTimeNoTimezone.getHours());
			m_DifferenceTime.setMinutes((ms_nTimeOnSet.getMinutes() + ms_nTimerSetTime.getMinutes()) - m_CurrTimeNoTimezone.getMinutes());
			m_DifferenceTime.setSeconds((ms_nTimeOnSet.getSeconds() + ms_nTimerSetTime.getSeconds()) - m_CurrTimeNoTimezone.getSeconds());
		}
		else
		{
			m_DifferenceTime.setHours(0);
			m_DifferenceTime.setMinutes(0);
			m_DifferenceTime.setSeconds(0);
		}

		if (!m_DifferenceTime.getHours() && !m_DifferenceTime.getMinutes() && !m_DifferenceTime.getSeconds())
		{
			ms_bTimerGoingOff = true;
			if (ms_bTimerGoingOff)
			{
				if ((m_nClockFramesPassed % 1000) > 499)
				{
					document.querySelector("#clock-viewport").style.background = "white";
				}
				else
				{
					document.querySelector("#clock-viewport").style.background = "black";
				}
			}			
		}

		// Get difference between current time and normal time
		document.querySelector("#timer-time").innerHTML = "<small>TIMER SET - " + FormatClockNumber(m_DifferenceTime.getHours()) + ":" + FormatClockNumber(m_DifferenceTime.getMinutes()) + ":" + FormatClockNumber(m_DifferenceTime.getSeconds()) + "</small>";
	}

	if (ms_bTimerSet)
	{
		if (ms_bTimerOn)
		{	
			if (m_CurrDate.getHours() > 19 || m_CurrDate.getHours() < 6)
			{
				document.querySelector("#timer-time").style.textShadow = "0 0 7.5px rgb(0, 255, 33), 0 0 7.5px rgb(0, 255, 33)";
			}
			else
			{
				document.querySelector("#timer-time").style.textShadow = "none";
			}
		}
	}

	// Alarm
	if (ms_bAlarmSet)
	{
		if (ms_bInitializedAlarm)
		{
			if (m_szClockMode == "CLOCKMODE_NL")
			{
				document.querySelector("#clock-time-alarm-text").innerHTML = "<small>ALARM SET - " + FormatClockNumber(ms_nTargetTime.getHours()) + ":" + FormatClockNumber(ms_nTargetTime.getMinutes()) + "</small>";
			}
			else
			{
				if (m_bShouldBeAlarmAM)
				{
					document.querySelector("#clock-time-alarm-text").innerHTML = "<small>ALARM SET - " + m_szVSAlarmHour + ":" + FormatClockNumber(ms_nTargetTime.getMinutes()) + " AM" + "</small>";
				}
				else
				{
					document.querySelector("#clock-time-alarm-text").innerHTML = "<small>ALARM SET - " + m_szVSAlarmHour + ":" + FormatClockNumber(ms_nTargetTime.getMinutes()) + " PM" + "</small>";
				}
			}
	
			if (m_CurrDate.getHours() > 19 || m_CurrDate.getHours() < 6)
			{
				document.querySelector("#clock-time-alarm-text").style.textShadow = "0 0 7.5px rgb(0, 255, 33), 0 0 7.5px rgb(0, 255, 33)";
			}
			else
			{
				document.querySelector("#clock-time-alarm-text").style.textShadow = "none";	
			}

			if (ms_bAlarmGoingOff)
			{
				if ((m_nClockFramesPassed % 1000) > 499)
				{
					document.querySelector("#clock-viewport").style.background = "white";
				}
				else
				{
					document.querySelector("#clock-viewport").style.background = "black";
				}
			}
		}
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
		document.querySelector("#stopwatch-lap-text").innerHTML = "";
		ms_nNumOfLaps = 0;
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
			document.querySelector("#stopwatch-btns").innerHTML += "<button onclick=\"ToggleStopwatch('STOPWATCH_SET_LAP')\">Nieuwe ronde</button>";
			document.querySelector("#stopwatch-btns").innerHTML += "<button onclick=\"ToggleStopwatch('STOPWATCH_RESET_ALL_LAPS')\">Reset alle rondes</button>";
		}
		break;
		case 'STOPWATCH_SET_LAP':
		if (ms_bStopwatchInitialized && ms_bStopwatchEnabled && ms_bShouldCountStopwatch)
		{
			ms_nNumOfLaps++;
			document.querySelector("#stopwatch-lap-text").innerHTML += "LAP " + ms_nNumOfLaps + " - " + getCurrentStopwatchTime() + "<br>";
		}
		break;
		case 'STOPWATCH_RESET_ALL_LAPS':
		if (ms_bStopwatchInitialized && ms_bStopwatchEnabled && ms_bShouldCountStopwatch)
		{
			ms_nNumOfLaps = 0;
			document.querySelector("#stopwatch-lap-text").innerHTML = "";
		}
		break;
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
	if (!n)
	{
		return "000";
	}
	else
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

// The stopwatch timer also uses Date.now for accurate time in milliseconds
// It is possible that the observed time may slowly drift off due to small differences in execution time.
// This will however be solveable with using Date for calculating the difference.
function processStopwatchTime()
{
	var m_szStopwatchString = "";
	if (ms_bShouldCountStopwatch)
	{
		m_nStopwatchTimer++;
	}	
	var m_StopwatchDate = new Date(m_nStopwatchTimer * 10); 
	m_szStopwatchString += FormatClockNumber(m_StopwatchDate.getUTCHours()) + ":" + FormatClockNumber(m_StopwatchDate.getMinutes()) + ":" + FormatClockNumber(m_StopwatchDate.getSeconds()) + " " + FormatMillisecondsNumber(m_StopwatchDate.getMilliseconds());
	return m_szStopwatchString; 
}

function getCurrentStopwatchTime()
{
	var m_szStopwatchString = "";
	var m_StopwatchDate = new Date(m_nStopwatchTimer * 10);
	m_szStopwatchString += FormatClockNumber(m_StopwatchDate.getUTCHours()) + ":" + FormatClockNumber(m_StopwatchDate.getMinutes()) + ":" + FormatClockNumber(m_StopwatchDate.getSeconds()) + " " + FormatMillisecondsNumber(m_StopwatchDate.getMilliseconds());
	return m_szStopwatchString; 	
}

function ToggleAlarm(m_szAlarmMode)
{
	switch (m_szAlarmMode)
	{
		case 'ALARM_ON':
		ms_bAlarmSet = false;
		ms_bAlarmGoingOff = false;
		ms_bAlarmOn = true;
		ms_nTargetTime = new Date(); 
		ms_bInitializedAlarm = true;
		document.querySelector("#alarm-btns").innerHTML = "";
		document.querySelector("#alarm-btns").innerHTML += "<button onclick=\"ToggleAlarm('ALARM_OFF')\">Alarm uit</button>";
		ToggleAlarmForm('ALARM_FORM_OPEN_WINDOW');
		break;
		case 'ALARM_OFF':
		ms_bAlarmSet = false;
		ms_bAlarmGoingOff = false;
		ms_bAlarmOn = false;
		ms_bInitializedAlarm = false;
		document.querySelector("#clock-viewport").style.background = "black";
		document.querySelector("#alarm-btns").innerHTML = "";
		document.querySelector("#clock-time-alarm-text").innerHTML = "";
		document.querySelector("#alarm-form-inner-container").style.display = "none";
		document.querySelector("#alarm-btns").innerHTML += "<button onclick=\"ToggleAlarm('ALARM_ON')\">Alarm aan</button>";
		break;
		// For debugging purposes only
		case 'ALARM_TRIGGER_NOW':
		if (ms_bAlarmOn && ms_bInitializedAlarm && !ms_bAlarmGoingOff)
		{
			ms_bAlarmGoingOff = true;
		}
		break;
	}
}

function ToggleAlarmForm(m_szAlarmFormMode)
{
	switch (m_szAlarmFormMode)
	{
		case 'ALARM_FORM_SEND':
		var a = document.querySelector("#alarm-form-input").value;
		var m_nTime = a.split(":");
		for (var i = 0; i < m_nTime.length; i++)
		{
			if (i == 0)
			{
				ms_nTargetTime.setHours(Number(m_nTime[i]));
			}
			else
			{
				ms_nTargetTime.setMinutes(Number(m_nTime[i]));
			}
		}
		document.querySelector("#alarm-form-inner-container").style.display = "none";
		ms_bAlarmSet = true;
		break;
		case 'ALARM_FORM_OPEN_WINDOW':
		document.querySelector("#alarm-form-inner-container").style.display = "block";
		break;
	}
}

function ToggleTimer(m_szTimerMode)
{
	var bFault = false;

	switch (m_szTimerMode)
	{
		case 'TIMER_ON':
		ms_nTimerSetTime = new Date();
		ms_bTimerSet = false;
		ms_bTimerOn = true;
		document.querySelector("#timer-time").innerHTML = "";
		document.querySelector("#timer-countdown-form").style.display = "block";
		document.querySelector("#timer-btns").innerHTML = "";
		document.querySelector("#timer-btns").innerHTML += "<button onclick=\"ToggleTimer('TIMER_OFF')\">Timer uit</button>"
		break;

		case 'TIMER_OFF':
		ms_bTimerSet = false;
		ms_bTimerOn = false;
		ms_bTimerGoingOff = false;
		document.querySelector("#clock-viewport").style.background = "black";
		document.querySelector("#timer-countdown-form").style.display = "none";
		document.querySelector("#timer-time").innerHTML = "";
		document.querySelector("#timer-btns").innerHTML = "";
		document.querySelector("#timer-btns").innerHTML = "<button onclick=\"ToggleTimer('TIMER_ON')\">Timer aan</button>";
		break;

		case 'TIMER_SUCCESS_TIME_SET':
		var a = document.querySelector("#timer-selector-input").value;
		var m_nTime = a.split(":");

		for (var i = 0; i < m_nTime.length; i++)
		{
			if (isNaN(Number(m_nTime[i])))
			{
				alert("Je kan geen letters of tekens gebruiken bij het instellen van de timer.");
				bFault = true;
				break;
			}
		}

		if (bFault)
		{
			break;
		}

		for (var i = 0; i < m_nTime.length; i++)
		{
			switch (i)
			{
				case 0:
				ms_nTimerSetTime.setHours(Number(m_nTime[i]));
				break;
				case 1:
				ms_nTimerSetTime.setMinutes(Number(m_nTime[i]));
				break;
				case 2:
				ms_nTimerSetTime.setSeconds(Number(m_nTime[i]));
				break;

			}
		}
		var b = Date.now();
		ms_nTimeOnSet = new Date(b);
		ms_bTimerSet = true;
		document.querySelector("#timer-countdown-form").style.display = "none";
		break;
	}
}
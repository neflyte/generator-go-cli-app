package logger

import (
	"fmt"
	"io"
	"os"
	"path"
	"time"

	"github.com/rs/zerolog"
)

const (
	logFileName      = "<%= appname %>.log"
	logDirectoryMode = 0755
	logFileMode      = 0644
)

var (
	// rootLogger is the application root logger instance
	rootLogger zerolog.Logger

	logFileHandle     *os.File
	logFilePath       string
	logPath           string
	loggerInitialized = false

	levelMap = map[string]zerolog.Level{
		"fatal": zerolog.FatalLevel,
		"error": zerolog.ErrorLevel,
		"warn":  zerolog.WarnLevel,
		"info":  zerolog.InfoLevel,
		"debug": zerolog.DebugLevel,
		"trace": zerolog.TraceLevel,
	}
)

func init() {
	// Override zerolog's default time field format so it doesn't truncate nanoseconds
	zerolog.TimeFieldFormat = time.RFC3339Nano
}

// InitLogger initializes the logger system
func InitLogger(logLevel string, enableConsole bool, enableLogFile bool) {
	var err error

	if loggerInitialized {
		return
	}
	// If both console logging and log file logging are disabled, re-enable console logging so messages can be seen
	if !enableConsole && !enableLogFile {
		enableConsole = true
	}
	if enableLogFile {
		configHome := getConfigHome()
		logPath = path.Join(configHome, "<%= appname %>")
		err = os.MkdirAll(logPath, logDirectoryMode)
		if err != nil {
			fmt.Printf("*  error creating log directory %s: %s\n", logPath, err.Error())
		}
		logFilePath = path.Join(logPath, logFileName)
		logFileHandle, err = os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_RDWR, logFileMode)
		if err != nil {
			logFileHandle = nil
		}
	}
	// Set up the log writers
	logWriters := make([]io.Writer, 0)
	if enableLogFile && logFileHandle != nil {
		logWriters = append(logWriters, logFileHandle)
	}
	if enableConsole {
		logWriters = append(logWriters, zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.StampMilli})
	}
	// Create a new root logger
	if len(logWriters) > 1 {
		rootLogger = zerolog.New(zerolog.MultiLevelWriter(logWriters...)).
			With().
			Timestamp().
			Logger()
	} else {
		rootLogger = zerolog.New(logWriters[0]).
			With().
			Timestamp().
			Logger()
	}
	// Set global logger message level
	lvl, ok := levelMap[logLevel]
	if !ok {
		lvl = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(lvl)
	loggerInitialized = true
}

// CleanupLogger cleans up the logger system before the app exits
func CleanupLogger() {
	if loggerInitialized {
		if logFileHandle != nil {
			err := logFileHandle.Close()
			if err != nil {
				fmt.Printf("*  error cleaning up logger: %s\n", err.Error())
			}
			logFileHandle = nil
		}
		loggerInitialized = false
	}
}

// GetFuncLogger returns a new logger with a string field `func` set to the supplied funcName
func GetFuncLogger(funcName string) zerolog.Logger {
	if !loggerInitialized {
		return getBasicConsoleLogger().With().Timestamp().Str("func", funcName).Logger()
	}
	return rootLogger.With().Str("func", funcName).Logger()
}

// GetStructLogger returns a new logger with a string field `struct` set to the supplied structName
func GetStructLogger(structName string) zerolog.Logger {
	if !loggerInitialized {
		return  getBasicConsoleLogger().With().Timestamp().Str("struct", structName).Logger()
	}
	return rootLogger.With().Str("struct", structName).Logger()
}

// GetPackageLogger returns a new logger with a string field `pkg` set to the supplied packageName
func GetPackageLogger(packageName string) zerolog.Logger {
	if !loggerInitialized {
		return getBasicConsoleLogger().With().Timestamp().Str("pkg", packageName).Logger()
	}
	return rootLogger.With().Str("pkg", packageName).Logger()
}

// getBasicConsoleLogger returns an initialized console logger which logs to STDERR at TRACE level.
// This function is used to get a logger when the logging subsystem has not yet been initialized.
func getBasicConsoleLogger() zerolog.Logger {
	return zerolog.New(&zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.StampMilli}).
		With().Timestamp().Logger().Level(zerolog.TraceLevel)
}

// getConfigHome attempts to determine the user's configuration files directory
func getConfigHome() string {
	log := GetFuncLogger("getConfigHome")
	// Look for XDG_CONFIG_HOME
	configHome, err := os.UserConfigDir()
	if err != nil {
		log.Err(err).Msg("error getting user config directory")
		configHome = ""
	}
	// Look for HOME
	if configHome == "" {
		configHome, err = os.UserHomeDir()
		if err != nil {
			log.Err(err).Msg("error getting user home directory")
			configHome = ""
		}
	}
	// Use CWD
	if configHome == "" {
		configHome = "."
	}
	return configHome
}

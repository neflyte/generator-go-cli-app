package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"<%= repourl %>/internal/logger"
)

var (
	// AppVersion is the application version number
	AppVersion = "dev"

	// rootCmd is the application's root command
	rootCmd = &cobra.Command{
		Use: "<%= appname %>",
		Short: "App short description",
		Long: "App long description",
		RunE: doRun,
		PersistentPostRun: doPostRun,
	}
	logLevel string
	enableLogFile bool
	enableConsole bool
)

func init() {
	cobra.OnInitialize(initLogger)
	rootCmd.PersistentFlags().StringVar(&logLevel, "logLevel", "info", "log message level (default: info)")
	rootCmd.PersistentFlags().BoolVar(&enableConsole, "console", true, "enable logging to console (default: true)")
	rootCmd.PersistentFlags().BoolVar(&enableLogFile, "logFile", false, "enable logging to log file (default: false)")
	// rootCmd.AddCommand(...)
	rootCmd.SetVersionTemplate(fmt.Sprintf("<%= appname %> %s", AppVersion))
}

func Execute() error {
	return rootCmd.Execute()
}

func initLogger() {
	logger.InitLogger(logLevel, enableConsole, enableLogFile)
}

func doRun(cmd *cobra.Command, args []string) error {
	// Main program goes here
	return nil
}

func doPostRun(_ *cobra.Command, _ []string) {
	// App cleanup goes here
	logger.CleanupLogger()
}

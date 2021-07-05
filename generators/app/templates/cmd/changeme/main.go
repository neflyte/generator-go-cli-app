package main

import (
	"fmt"
	"os"
	"<%= repourl %>/cmd/<%= appname %>/cmd"
)

func main() {
	err := cmd.Execute()
	if err != nil {
		fmt.Printf("*  program error: %s", err.Error())
		os.Exit(1)
	}
}

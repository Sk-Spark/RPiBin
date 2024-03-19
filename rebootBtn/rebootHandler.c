#include <stdio.h>
#include <stdlib.h>
#include <wiringPi.h>

#define GPIO_PIN 18
#define REBOOT_TIME_THRESHOLD 5 // in seconds

int main() {
    // Initialize WiringPi library
    if (wiringPiSetup() == -1) {
        fprintf(stderr, "Failed to initialize WiringPi\n");
        return 1;
    }

    // Set GPIO pin mode to input
    pinMode(GPIO_PIN, INPUT);

    int previousState = LOW;
    int currentState;
    unsigned long startTime = 0;

    while (1) {
        currentState = digitalRead(GPIO_PIN);

        if (currentState != previousState) {
            startTime = millis(); // Reset timer when button state changes
        }

        if (currentState == HIGH && previousState == LOW) {
            startTime = millis(); // Start timer when button is pressed
        }

        if (currentState == LOW && previousState == HIGH) {
            unsigned long elapsedTime = millis() - startTime;

            if (elapsedTime >= (REBOOT_TIME_THRESHOLD * 1000)) {
                printf("Button pressed for more than 5 seconds. Rebooting...\n");
                delay(1000); // Delay for stability
                system("sudo reboot"); // Reboot Raspberry Pi
                break; // Exit loop after reboot command
            }
        }

        previousState = currentState;
        delay(500); // Delay for debouncing and smooth operation
    }

    return 0;
}

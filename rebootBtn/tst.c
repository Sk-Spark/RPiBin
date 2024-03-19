#include <stdio.h>
#include <wiringPi.h>

#define GPIO_PIN 18

int main() {
    // Initialize WiringPi library
    if (wiringPiSetup() == -1) {
        fprintf(stderr, "Failed to initialize WiringPi\n");
        return 1;
    }

    // Set GPIO pin mode to input
    pinMode(GPIO_PIN, INPUT);

    // Read and print the value of GPIO 18
    int value = digitalRead(GPIO_PIN);
    printf("GPIO %d value: %d\n", GPIO_PIN, value);

    return 0;
}

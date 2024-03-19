#include <stdio.h>
#include <stdlib.h>
#include <wiringPi.h>

#define BUTTON_PIN 1
#define LONG_PRESS_DURATION 3000 // 3 seconds in milliseconds

void button_pressed()
{
    static unsigned long press_start_time = 0;
    unsigned long press_duration;

    press_start_time = millis();
    while(digitalRead(BUTTON_PIN) == LOW){
        delay(500);
        press_duration = millis() - press_start_time;
        if( press_duration > LONG_PRESS_DURATION ){
            printf(" Rebooting...\n");
            system("sudo reboot");
        }
    }

    press_start_time = 0;    
}

int main()
{
    // Initialize WiringPi library
    if (wiringPiSetup() == -1) {
        fprintf(stderr, "Failed to initialize WiringPi\n");
        return 1;
    }
    pinMode(BUTTON_PIN, INPUT);
    // pullUpDnControl(BUTTON_PIN, PUD_UP);

    if (wiringPiISR(BUTTON_PIN, INT_EDGE_FALLING, &button_pressed) < 0)
    {
        fprintf(stderr, "Unable to setup ISR\n");
        return 1;
    }

    printf("Press and hold the button for 3 seconds to reboot...\n");

    while (1)
    {
        delay(1000);
    }

    return 0;
}

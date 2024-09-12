package com.vestigeshopping;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

// import java.util.Timer;
// import java.util.TimerTask;

/**
 * Created by AnkurSharma on 23/08/18.
 */

public class SplashActivity extends AppCompatActivity {
    
    // Splash Screen Timer
    // private static int SPLASH_TIME_OUT = 5000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtras(this.getIntent());
        startActivity(intent);
        finish();
        
        // Timer timer = new Timer();
        // TimerTask timerTask = new TimerTask() {
        //     @Override
        //     public void run() {
        //         Intent intent = new Intent(SplashActivity.this, MainActivity.class);
        //         startActivity(intent);
        //         finish();
        //     }
        // };
        // timer.schedule(timerTask,SPLASH_TIME_OUT);
    }
}

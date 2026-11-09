package com.pandaswitch.app

import android.annotation.SuppressLint
import android.content.Context
import android.location.Criteria
import android.location.Location
import android.location.LocationManager
import android.os.Bundle
import android.os.SystemClock
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import android.app.Activity

class MainActivity : Activity() {

    private lateinit var webView: WebView
    private var locationManager: LocationManager? = null
    private val providerName = LocationManager.GPS_PROVIDER
    private var isMockingActive = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager

        webView = findViewById(R.id.webView)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()

        webView.addJavascriptInterface(WebAppInterface(this), "AndroidGPS")
        webView.loadUrl("file:///android_asset/index.html")
    }

    inner class WebAppInterface(private val context: Context) {
        @JavascriptInterface
        fun startSpoofing(lat: Double, lng: Double) {
            runOnUiThread {
                try {
                    if (!isMockingActive) {
                        locationManager?.addTestProvider(
                            providerName, false, false, false, false,
                            true, true, true, Criteria.POWER_LOW, Criteria.ACCURACY_FINE
                        )
                        locationManager?.setTestProviderEnabled(providerName, true)
                        isMockingActive = true
                    }

                    val mockLocation = Location(providerName).apply {
                        latitude = lat
                        longitude = lng
                        altitude = 15.0
                        time = System.currentTimeMillis()
                        accuracy = 1.0f
                        elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
                    }

                    locationManager?.setTestProviderLocation(providerName, mockLocation)
                    Toast.makeText(context, "GPS Teleported: $lat, $lng", Toast.LENGTH_SHORT).show()
                } catch (e: SecurityException) {
                    Toast.makeText(context, "Set PANDA-Switch as Mock Location app in Developer Options", Toast.LENGTH_LONG).show()
                } catch (e: Exception) {
                    Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface
        fun stopSpoofing() {
            runOnUiThread {
                try {
                    if (isMockingActive) {
                        locationManager?.removeTestProvider(providerName)
                        isMockingActive = false
                    }
                    Toast.makeText(context, "Spoofing Stopped", Toast.LENGTH_SHORT).show()
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }
}

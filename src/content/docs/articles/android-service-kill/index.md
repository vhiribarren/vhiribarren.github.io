---
title: Effect of swiping an Android app in recent app list
publishDate: 2016-06-05
tags: [programming, mobile, android]
---

:::caution
This article is quite old. Since the Android ecosystem evolves quickly,
it may not be up to date.
:::

By nature, an Android app can be stopped and killed any time by the user or the
system. The system can decide to kill an app to free some memory. It is also
very easy for the user to display the recent app list and to swipe an app,
thinking he kills the app by doing so.

Contrary to iOS, Android allows running some background tasks through Services;
knowing the effects of an app swipe on services is important to correctly
implement apps' services.

What exactly happens after a "kill" initiated by the user? How can we react
and protect the execution of a background service? Android provides tools to
give some priorities to services, but what exactly happens to the lifecyle of
the app hosting the service?

We concentrate on kill initiated by a swipe in the recent app list. It is also
possible to kill an app using the hidden developer menu in the settings, but
it is dedicated to developers and it effectively completely kills an app and
its services.

## Experimentation on Services

We create 3 main classes:

- `MyApplication` to monitor when an application is completely recreated; it
   inherits from the `Application` class
- `MyActivity` to launch a service, our main `Activity`
- `MyService` to monitor when a service is destroyed by the system

Each class has some logs displayed in Logcat. For each app:

1. the app is launched
2. the recent app list menu is triggered and the app is swipped
3. the app is then manally launched again

Logs are collected and studied.

`MyApplication` does not vary from a test to another. The first implement of
`MyActivity` is common to several tests. Here are their implementations.

Code is [available on GitHub](https://github.com/vhiribarren/tuto-android-service-kill).

**MyApplication.java**

```java
public class MyApplication extends Application {

    private static final String TAG = MyApplication.class.getSimpleName();

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG, "onCreate()");
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        Log.i(TAG, "onLowMemory()");
    }
}
```

**MyActivity.java**

```java
public class MyActivity extends Activity {

    private static final String TAG = MyActivity.class.getSimpleName();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.i(TAG, "onCreate()");
        Intent serviceIntent = new Intent(this, MyService.class);
        startService(serviceIntent);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "onDestroy()");
    }

}
```


### START_NOT_STICKY service

In this test, we create a service in `START_NOT_STICKY` mode. This is the
simplest of all test cases.

**MyService.java**

```java
public class MyService extends Service {

    private static final String TAG = MyService.class.getSimpleName();

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG, "onCreate()");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "onStartCommand()");
        return START_NOT_STICKY;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        super.onTaskRemoved(rootIntent);
        Log.i(TAG, "onTaskRemoved()");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "onDestroy()");
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        Log.i(TAG, "onLowMemory()");
    }
}
```

1) App launch

```
30851-30851/net.alea.tuto.service_kill.notsticky I/MyApplication: onCreate()
30851-30851/net.alea.tuto.service_kill.notsticky I/MyActivity: onCreate()
30851-30851/net.alea.tuto.service_kill.notsticky I/MyService: onStartCommand()
```

2) App swipe

```
30851-30851/net.alea.tuto.service_kill.notsticky I/MyActivity: onDestroy()
30851-30851/net.alea.tuto.service_kill.notsticky I/MyService: onTaskRemoved()
```

The app is completely stopped. It is launched again, we have the same logs than
in step 1.

**Conclusion**: the app is simply and completely killed.

It is interesting to note `MyService.onDestroy()` is not called. Actually, you
must explicitely called `MyService.finish()` if you want to be sure
`onDestroy()` is called. Another way to be sure this method is called is to
manually kill the app in the hidden developer menu in Android settings.

### START_STICKY service

By using the `START_STICKY` mode, we directly ask the system to recreate the
service if it is killed. But how does it exactly work?

We write the following modification in the `MyService` class.

```java
@Override
public int onStartCommand(Intent intent, int flags, int startId) {
    Log.i(TAG, "onStartCommand()");
    return START_STICKY;
}
```

1) App launch

```
31892-31892/net.alea.tuto.service_kill.sticky I/MyApplication: onCreate()
31892-31892/net.alea.tuto.service_kill.sticky I/MyActivity: onCreate()
31892-31892/net.alea.tuto.service_kill.sticky I/MyService: onCreate()
31892-31892/net.alea.tuto.service_kill.sticky I/MyService: onStartCommand()
```

2) App swipe

```
31892-31892/net.alea.tuto.service_kill.sticky I/MyActivity: onDestroy()
31892-31892/net.alea.tuto.service_kill.sticky I/MyService: onTaskRemoved()
```

The previous process is killed, but a new one is then immediately launched.

```
32254-32254/net.alea.tuto.service_kill.sticky I/MyApplication: onCreate()
32254-32254/net.alea.tuto.service_kill.sticky I/MyService: onCreate()
32254-32254/net.alea.tuto.service_kill.sticky I/MyService: onStartCommand()
```

**Conclusion**: the app is completely destroyed, and then completely recreated.
No Activity is called, but the Application class is recreated before respawning
the service.

So be sure to correctly intialize what the Service needs in the Application
class, **not** in the main Activity class.


### startForeground service

Here, we explicitely tells the system the service is important and must not be
considered as a background task that can be killd anytime. Actually, it is
mandatory to provide a `Notification` object, so the user is explicitely warned
that his app stays alive.

We write the following modification in the `MyService` class.

```java
@Override
public void onCreate() {
    super.onCreate();
    Log.i(TAG, "onCreate()");
    Notification notification = new Notification();
    startForeground(42, notification);
}
```

1) App launch

```
4144-4144/net.alea.tuto.service_kill.foreground I/MyApplication: onCreate()
4144-4144/net.alea.tuto.service_kill.foreground I/MyActivity: onCreate()
4144-4144/net.alea.tuto.service_kill.foreground I/MyService: onCreate()
4144-4144/net.alea.tuto.service_kill.foreground I/MyService: onStartCommand()
```

2) App swipe

```
4144-4144/net.alea.tuto.service_kill.foreground I/MyActivity: onDestroy()
4144-4144/net.alea.tuto.service_kill.foreground I/MyService: onTaskRemoved()
```

Even if `onTaskRemoved()` is called, the app is **not killed** in this case.
The service continue to exist. It can be proven by going to the hidden developer
menu to check running processes.

3) New app launch

```
4144-4144/net.alea.tuto.service_kill.foreground I/MyActivity: onCreate()
4144-4144/net.alea.tuto.service_kill.foreground I/MyService: onStartCommand()
```

Neither the MyApplication.onCreate() method nor MyService.onCreate() are called. Actually, the app was never killed.

**Conclusion**: this case is a very good candidate to make a service persist in
case of a manual kill by the user. The app and the service are never killed:
only the Activity (usually the visual part) is destroyed from memory.

Be careful to the lifecycle of the app: a new Activity is recreated when the app
is launched again, but the `MyApplication` object is not recreated and was never
destroyed.

## Diagram summary

A service can always be destroyed due to low memory or manual killing through
the hidden developer menu, so it is a case to be taken into account anyway.

So far, the `startForeground` mechanism seems the best since it protects an
app to restart, contrary to the `START_NOT_STICKY` method.

Beware of the cases where the `Application` class is called or is not called.

[![Activity Diagram][activity-diagram]][activity-diagram]

[activity-diagram]: img/activity-service-diagram.png

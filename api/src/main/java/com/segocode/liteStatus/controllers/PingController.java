package com.segocode.liteStatus.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class PingController {
    @RequestMapping(value = "/statusServices", produces = "application/text", method = RequestMethod.GET)
    @ResponseBody
    public String statusServices() {
        return "hello";
    }

}
